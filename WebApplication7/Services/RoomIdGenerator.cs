using System;
using System.Text;

namespace WebApplication7.Services
{
    public class RoomIdGenerator
    {
        public static string GenerateId(int tokenLength = 10)
        {
            Random rnd = new Random();

            StringBuilder strBld = new StringBuilder("");

            for (int i = 0; i < tokenLength; i++)
                strBld.Append((char)(rnd.Next(65, 90) + (rnd.Next(0,10) > 5 ? 32 : 0)));

            return strBld.ToString();
        }
    }
}
