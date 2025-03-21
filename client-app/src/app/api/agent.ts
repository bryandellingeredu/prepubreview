import axios, { AxiosResponse } from 'axios';
import { Publication } from '../models/publication';
import { store } from '../stores/store';
import { AppUser } from '../models/appUser';
import { PublicationDTO } from '../models/publicationDTO';
import { AttachmentMetaData } from '../models/attachmentMetaData';
import { UserSubject } from '../models/userSubject';
import { Administrator } from '../models/administrator';
import { AdministratorDTO } from '../models/administratorDTO';
import { SecurityOfficer } from '../models/securityOfficer';
import { InitialThreadDTO } from '../models/initialThreadDTO';
import { TeamMember } from '../models/teammember';
import { TeammemberDTO } from '../models/teamMemberDTO';


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
    list: (offset: number, limit: number, filters: any) =>
      requests.post<Publication[]>('/publications/filterlist',  {
        offset,
        limit,
        ...filters, 
      } ),
    listMine: () => requests.get<Publication[]>('/publications/mine'),
    details: (id: string) => requests.get<Publication>(`/publications/${id}`),
    createUpdate: (publicationDTO: PublicationDTO) => requests.post<void>('/publications', publicationDTO),
    search: (searchQuery: string) => requests.post<Publication[]>('/publications/search', {searchQuery}),
    delete: (id: string) => requests.del<void>(`/publications/${id}`)
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

  const Administrators =  {
    list: () => requests.get<Administrator[]>('/Administrators'),
    create: (administratorDTO: AdministratorDTO) => requests.post<void>('/Administrators', administratorDTO),
    delete: (id: string) => requests.del<void>(`/Administrators/${id}`)
  }

  const TeamMembers =  {
    list: () => requests.get<TeamMember[]>('/TeamMembers'),
    create: (teamMemberDTO: TeammemberDTO) => requests.post<void>('/TeamMembers', teamMemberDTO),
    delete: (id: string) => requests.del<void>(`/TeamMembers/${id}`)
  }


  const SecurityOfficers = {
    list: () => requests.get<SecurityOfficer[]>('/SecurityOfficers'),
    createUpdate: (securityOfficer: SecurityOfficer) => requests.post<void>('/SecurityOfficers', securityOfficer),
    delete: (id: string) => requests.del<void>(`/SecurityOfficers/${id}`)
  }

  const Threads ={
    addInitialThread: (initalThreadDTO: InitialThreadDTO) => requests.post<void>('/Threads/addinitial', initalThreadDTO ),
    addInitialSupervisorThread: (initalThreadDTO: InitialThreadDTO) => requests.post<void>('/Threads/addinitialsupervisor', initalThreadDTO ),
    addSMEReviewThread: (threadId :string, comments : string, commentsAsHTML : string, reviewStatus : string) =>  requests.post<void>('/Threads/addSMEReviewThread', {threadId, comments, commentsAsHTML, reviewStatus}),
    addSupervisorReviewThread: (threadId :string, comments : string, commentsAsHTML : string, reviewStatus : string) =>  requests.post<void>('/Threads/addSupervisorReviewThread', {threadId, comments, commentsAsHTML, reviewStatus}),
    resubmitToSMEAfterRevision: (threadId :string, comments : string, commentsAsHTML : string) =>  requests.post<void>('/Threads/resubmitToSMEAfterRevision', {threadId, comments, commentsAsHTML, reviewStatus: ''}),
    resubmitToOPSECAfterRevision: (threadId :string, comments : string, commentsAsHTML : string) =>  requests.post<void>('/Threads/resubmitToOPSECAfterRevision', {threadId, comments, commentsAsHTML, reviewStatus: ''}),
    resubmitToSupervisorAfterRevision: (threadId :string, comments : string, commentsAsHTML : string) =>  requests.post<void>('/Threads/resubmitToSupervisorAfterRevision', {threadId, comments, commentsAsHTML, reviewStatus: ''}),
    addOPSECReviewThread: (threadId :string, comments : string, commentsAsHTML : string, reviewStatus : string) =>  requests.post<void>('/Threads/addOPSECReviewThread', {threadId, comments, commentsAsHTML, reviewStatus}),
  }


  const agent = {
    Publications,
    AppUsers,
    Uploads,
    AttachmentMetaDatas,
    SubjectMatterExperts,
    Administrators,
    SecurityOfficers,
    Threads,
    TeamMembers
  }

  
  export default agent;


