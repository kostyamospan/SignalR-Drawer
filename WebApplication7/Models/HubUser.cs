using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace WebApplication7.Models
{
    public class HubUser
    {
        public string ConnectionId { get; set; }
        public DrawRoom Room { get; set; }


        public HubUser() { }


        public HubUser(string connectionId)
        {
            ConnectionId = connectionId;
        }
    }

    public class HubUserComparer : IEqualityComparer<HubUser>
    {
        public bool Equals([AllowNull] HubUser x, [AllowNull] HubUser y)
        {
            return x.ConnectionId.Equals(y.ConnectionId);
        }

        public int GetHashCode([DisallowNull] HubUser obj)
        {
            return base.GetHashCode();
        }
    }
}



