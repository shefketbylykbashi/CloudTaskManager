using CloudTask.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CloudTask.Data.Configurations
{
    public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            var utcDateTimeConverter = new ValueConverter<DateTime, DateTime>(
                value => value.ToUniversalTime(),
                value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

            var nullableUtcDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                value => value.HasValue ? value.Value.ToUniversalTime() : value,
                value => value.HasValue
                    ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
                    : value);

            builder.ToTable("TaskItems", tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_TaskItems_Status",
                    "[Status] IN ('Pending', 'InProgress', 'Completed')");
                tableBuilder.HasCheckConstraint(
                    "CK_TaskItems_Priority",
                    "[Priority] IN ('Low', 'Medium', 'High')");
            });

            builder.HasKey(taskItem => taskItem.Id);

            builder.Property(taskItem => taskItem.Id)
                .UseIdentityColumn();

            builder.Property(taskItem => taskItem.Title)
                .IsRequired()
                .HasMaxLength(150)
                .IsUnicode();

            builder.Property(taskItem => taskItem.Description)
                .HasMaxLength(2000)
                .IsUnicode();

            builder.Property(taskItem => taskItem.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsUnicode()
                .IsRequired();

            builder.Property(taskItem => taskItem.Priority)
                .HasConversion<string>()
                .HasMaxLength(10)
                .IsUnicode()
                .IsRequired();

            builder.Property(taskItem => taskItem.DueDate)
                .HasColumnType("datetime2")
                .HasConversion(nullableUtcDateTimeConverter);

            builder.Property(taskItem => taskItem.CreatedAt)
                .HasColumnType("datetime2")
                .HasConversion(utcDateTimeConverter);

            builder.Property(taskItem => taskItem.UpdatedAt)
                .HasColumnType("datetime2")
                .HasConversion(nullableUtcDateTimeConverter);

            builder.HasIndex(taskItem => taskItem.Status);
            builder.HasIndex(taskItem => taskItem.Priority);
            builder.HasIndex(taskItem => taskItem.DueDate);
            builder.HasIndex(taskItem => taskItem.CreatedAt);
        }
    }
}
