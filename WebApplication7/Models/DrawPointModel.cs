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
}
