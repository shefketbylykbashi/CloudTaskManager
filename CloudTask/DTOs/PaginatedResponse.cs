namespace CloudTask.DTOs
{
    public class PaginatedResponse<T>
    {
        public PaginatedResponse(
            IReadOnlyCollection<T> items,
            int totalCount,
            int page,
            int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            Page = page;
            PageSize = pageSize;
            TotalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling(totalCount / (double)pageSize);
        }

        public IReadOnlyCollection<T> Items { get; }

        public int TotalCount { get; }

        public int Page { get; }

        public int PageSize { get; }

        public int TotalPages { get; }
    }
}
