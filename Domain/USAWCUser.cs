
namespace Domain
{
    public class USAWCUser
    {
        public int PersonId { get; set; }
        public string FirstName { get; set; }  
        public string LastName { get; set; }
         public string MiddleName { get; set; }  
        public string ArmyEmail {get; set;} 
        public string EduEmail {get; set;}

        public int? OrganizationId {get; set;}
        
         public string  OrganizationDisplay {get; set;}

         public bool IsAdmin {get; set;}    

    }
}
