using System.Text.Json.Serialization;

namespace WebApplication7.Models
{
    public class Color
    {
        [JsonPropertyName("r")]
        public byte R { get; set; }
        
        [JsonPropertyName("g")]
        public byte G { get; set; }
        
        [JsonPropertyName("b")]
        public byte B { get; set; }
        
        [JsonPropertyName("a")]
        public float A { get; set; }
    }
}
