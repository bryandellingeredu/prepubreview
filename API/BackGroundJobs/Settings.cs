namespace API.BackGroundJobs
{
    public class Settings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string TenantId { get; set; }
        public string ServiceAccount { get; set; }



        public Settings LoadSettings(IConfiguration config)
        {
            var c = config.GetRequiredSection("GraphHelper");
            return c.Get<Settings>();
        }
    }
}
