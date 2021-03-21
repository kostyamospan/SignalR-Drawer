using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace WebApplication7.Models
{
    public class DrawPointModel
    {
        [JsonPropertyName("x")]
        public double X { get; set; }
        
        [JsonPropertyName("y")]
        public double Y { get; set; }

        [JsonPropertyName("color")]
        public Color Color { get; set; }
    }


    public class DrawPointModelComparer : IEqualityComparer<DrawPointModel>
    {
        public bool Equals([AllowNull] DrawPointModel x, [AllowNull] DrawPointModel y)
        {
            return x.X == y.X && x.Y == y.Y;
        }

        public int GetHashCode([DisallowNull] DrawPointModel obj)
        {
            return obj.GetHashCode();
        }
    }
}


