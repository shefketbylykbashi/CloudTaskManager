namespace CloudTask.DTOs
{
    public class TaskStatsResponse
    {
        public int TotalTasks { get; set; }

        public int PendingTasks { get; set; }

        public int InProgressTasks { get; set; }

        public int CompletedTasks { get; set; }

        public int OverdueTasks { get; set; }

        public decimal CompletionRate { get; set; }
    }
}
