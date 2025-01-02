using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;

namespace Application.Repository
{
    public interface ISubjectMatterExpertDTOService
    {
         Task<List<UserWithSubjectsDTO>> GetSubjectMatterExpertsDTOsAsync();
    }
}