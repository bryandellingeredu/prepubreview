import axios, { AxiosResponse } from 'axios';
import { Publication } from '../models/publication';
import { store } from '../stores/store';
import { AppUser } from '../models/appUser';
import { PublicationDTO } from '../models/publicationDTO';
import { AttachmentMetaData } from '../models/attachmentMetaData';
import { UserSubject } from '../models/userSubject';


axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

axios.interceptors.request.use((config) => {
  const token = store.userStore.token;
  console.log("Token:", token);
  if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization Header Set:", config.headers.Authorization);
  }
  console.log("Axios Request Headers:", config.headers);
  return config;
});


  const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) =>
      axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
  };

  const Publications = {
    list: (offset: number, limit: number) =>
      requests.get<Publication[]>(`/publications?offset=${offset}&limit=${limit}`),
    details: (id: string) => requests.get<Publication>(`/publications/${id}`),
    createUpdate: (publicationDTO: PublicationDTO) => requests.post<void>('/publications', publicationDTO),
    search: (searchQuery: string) => requests.post<Publication[]>('/publications/search', {searchQuery})
  }

  const AppUsers = {
    login: () => requests.post<AppUser>('/appusers/login', {}),
    list: () => requests.get<AppUser[]>('/appusers')
  }

  const AttachmentMetaDatas ={
    details: (lookupId: string) => requests.get<AttachmentMetaData>(`/attachmentMetaDatas/${lookupId}`),
    delete: (lookupId: string) => requests.del<void>(`/attachmentMetaDatas/${lookupId}`)
  }

  const Uploads = {
    uploadPublication: (file: Blob, lookupId: string) => {
      let formData = new FormData();
      formData.append('File', file);
      formData.append('lookupId', lookupId);
      return axios.post('upload', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
    },
  }

  const SubjectMatterExperts = {
    list: () => requests.get<UserSubject[]>('/SubjectMatterExpertDTOs')
  }


  const agent = {
    Publications,
    AppUsers,
    Uploads,
    AttachmentMetaDatas,
    SubjectMatterExperts
  }

  
  export default agent;


