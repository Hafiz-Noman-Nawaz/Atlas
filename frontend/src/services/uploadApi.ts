import api from './api';
import type { Attachment } from '../types';

export const uploadApi = {
  uploadFile: async (file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<Attachment>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },
};
