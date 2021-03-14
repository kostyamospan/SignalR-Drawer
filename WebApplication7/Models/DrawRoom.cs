using System.Collections.Generic;
using System.Linq;

namespace WebApplication7.Models
{
    public class DrawRoom
    {
        private HashSet<string> connectedUsers = new HashSet<string>();

        public string RoomId { get; private set; }


        public DrawRoom(string roomId)
        {
            RoomId = roomId;
        }

        public DrawRoom() { }


        public void AddUser(string connId) => connectedUsers.Add(connId);

        public void RemoveUser(string connId) => connectedUsers.Remove(connId);

        public IReadOnlyList<string> GetAllUsers() => connectedUsers.ToList().AsReadOnly();
    }
}
