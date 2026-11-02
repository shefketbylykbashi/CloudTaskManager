using CloudTask.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudTask.Data
{
    public class CloudTaskDbContext : DbContext
    {
        public CloudTaskDbContext(DbContextOptions<CloudTaskDbContext> options)
            : base(options)
        {
        }

        public DbSet<TaskItem> TaskItems => Set<TaskItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(CloudTaskDbContext).Assembly);
        }
    }
}
