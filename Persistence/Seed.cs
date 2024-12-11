
using Domain;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context){
            if (context.Publications.Any()) return;

            var publications = new List<PrePublication_Publication>{
                new PrePublication_Publication{
                    Title= "The Primose Path of AI-Enabled Warfare"
                },
                new PrePublication_Publication{
                    Title= "Darrin Fry nanotechnology podcast"
                },
                new PrePublication_Publication{
                    Title= "Tricks of the Trade"
                },
                new PrePublication_Publication{
                    Title= "Stategy Short of War: The Logistics of the Berlin Airlift"
                },
                new PrePublication_Publication{
                    Title= "Artificial Intelligence and Logistics on the Modern Battlefield"
                },
                new PrePublication_Publication{
                    Title= "Professionals Talk Logistics Introduction"
                },
                new PrePublication_Publication{
                    Title= "SOIC Columbia FARC 1964-2016"
                },
            };

            await context.Publications.AddRangeAsync(publications);
            await context.SaveChangesAsync();
        }
    }
}