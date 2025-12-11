const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Document interface matching backend response
export interface Document {
  id: string;
  filename: string;
  storage_path: string;
  file_size: number;
  page_count: number;
  chunk_count: number;
  uploaded_at: string;
  user_id: string | null;
}

export interface DocumentListResponse {
  success: boolean;
  total_documents: number;
  documents: Document[];
}

export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || 'An unexpected error occurred'
    );
  }
  return response.json();
}

export const api = {
  // Document endpoints
  uploadDocument: async (file: File) => {
    console.log('API: Starting upload for', file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      console.log('API: Response status', response.status);
      return handleResponse<{
        success: boolean;
        document_id: string;
        filename: string;
        chunks_created: number;
      }>(response);
    } catch (error) {
      console.error('API: Upload error', error);
      throw error;
    }
  },

  listDocuments: async () => {
    const response = await fetch(`${API_BASE_URL}/documents/list`);
    return handleResponse<DocumentListResponse>(response);
  },

  deleteDocumentById: async (documentId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    return handleResponse<{
      success: boolean;
      document_id: string;
      filename: string;
      chunks_deleted: number;
      message: string;
    }>(response);
  },

  getDocumentUrl: async (documentId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/url`);
    return handleResponse<{
      success: boolean;
      document_id: string;
      filename: string;
      url: string;
    }>(response);
  },

  // Legacy: delete by filename (for backward compatibility)
  deleteDocument: async (filename: string) => {
    const response = await fetch(
      `${API_BASE_URL}/documents/by-name/${filename}`,
      {
        method: 'DELETE',
      }
    );
    return handleResponse<{
      success: boolean;
      chunks_deleted: number;
    }>(response);
  },

  // Chat endpoints
  askQuestion: async (question: string, userId: string = 'default_user') => {
    const response = await fetch(`${API_BASE_URL}/chat/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, user_id: userId }),
    });
    return handleResponse<{
      answer: string;
      sources_used: number;
      conversation_length: number;
    }>(response);
  },

  clearConversation: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/clear/${userId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/chat/stats`);
    return handleResponse<any>(response);
  },
};
