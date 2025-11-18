import { Client, Account, OAuthProvider, Storage, ID, Models } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const storage = new Storage(client);

export { OAuthProvider };

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

export const PLAN_LIMITS = {
  free: {
    storage: 5 * 1024 * 1024 * 1024,
    documents: 10,
    displayStorage: '5 GB'
  },
  pro: {
    storage: 15 * 1024 * 1024 * 1024,
    documents: 500,
    displayStorage: '15 GB'
  },
  enterprise: {
    storage: Infinity,
    documents: Infinity,
    displayStorage: 'Unlimited'
  },
  admin: {
    storage: Infinity,
    documents: Infinity,
    displayStorage: 'Unlimited'
  }
};

export const getUserPlan = (user: Models.User<Models.Preferences> | null): 'free' | 'pro' | 'enterprise' | 'admin' => {
  if (!user || !user.labels) return 'free';
    if (user.labels.includes('admin')) return 'admin';
  if (user.labels.includes('enterprise')) return 'enterprise';
  if (user.labels.includes('pro')) return 'pro';
  if (user.labels.includes('free')) return 'free';
  return 'free';
};

export const getUserPlanLimits = (user: Models.User<Models.Preferences> | null) => {
  const plan = getUserPlan(user);
  return PLAN_LIMITS[plan];
};

export const loginWithGoogle = async () => {
  try {
    await account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/dashboard`,
      `${window.location.origin}/auth/login?error=oauth_failed`
    );
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    console.error('Email login error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
    try {
      await account.deleteSession('current');
    } catch (e) {
    }
    
    const user = await account.create('unique()', email, password, name);
    
    await account.createEmailPasswordSession(email, password);
    
    try {
      await fetch('/api/users/assign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.$id })
      });
    } catch (labelError) {
      console.error('Failed to assign free label:', labelError);
    }
    
    await account.deleteSession('current');
    
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    
    const hasPlanLabel = user.labels?.some((label: string) => 
      ['free', 'pro', 'enterprise', 'admin'].includes(label)
    );
    
    if (!hasPlanLabel) {
      try {
        await fetch('/api/users/assign-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.$id })
        });
        return await account.get();
      } catch (labelError) {
        console.error('Failed to assign free label:', labelError);
      }
    }
    
    return user;
  } catch (error) {
    return null;
  }
};

export const uploadDocument = async (file: File, userId: string, onProgress?: (progress: number) => void) => {
  try {
    const fileId = ID.unique();
    const response = await storage.createFile(
      BUCKET_ID,
      fileId,
      file,
      [`read("user:${userId}")`, `write("user:${userId}")`, `delete("user:${userId}")`],
      onProgress ? (uploadProgress) => {
        const percentage = (uploadProgress.$id ? uploadProgress.chunksUploaded / uploadProgress.chunksTotal : 0) * 100;
        onProgress(percentage);
      } : undefined
    );
    
    return response;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const listDocuments = async () => {
  try {
    const response = await storage.listFiles(BUCKET_ID);
    return response.files;
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
};

export const deleteDocument = async (fileId: string) => {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
    
    try {
      const response = await fetch('/api/documents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: fileId }),
      });
      
      if (!response.ok) {
        console.warn('⚠️ Failed to delete from Qdrant, but file deleted from storage');
      }
    } catch (qdrantError) {
      console.warn('⚠️ Qdrant deletion failed:', qdrantError);
    }
    
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const getFilePreview = (fileId: string) => {
  try {
    return storage.getFilePreview(BUCKET_ID, fileId);
  } catch (error) {
    console.error('Preview error:', error);
    return null;
  }
};

export const downloadDocument = (fileId: string) => {
  try {
    return storage.getFileDownload(BUCKET_ID, fileId);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const renameDocument = async (fileId: string, newName: string) => {
  try {
    const response = await fetch('/api/documents/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: fileId, newName }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to rename file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Rename error:', error);
    throw error;
  }
};
