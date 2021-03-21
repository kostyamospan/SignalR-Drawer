using System;
using System.Collections.Generic;
using System.Linq;

namespace WebApplication7.Models
{
    public class DrawRoom
    {
        private HashSet<HubUser> _connectedUsers = new HashSet<HubUser>();

        private HashSet<DrawPointModel> _fieldState = new HashSet<DrawPointModel>(new DrawPointModelComparer());

        public string RoomId { get; private set; }


        public DrawRoom(string roomId)
        {
            RoomId = roomId;
        }

        public DrawRoom() { }


        public void AddUser(HubUser newUser) => _connectedUsers.Add(newUser);

        public void RemoveUser(HubUser user) => _connectedUsers.Remove(user);

        public void AddPointToField(DrawPointModel p) => _fieldState.Add(p);

        public void ClearField() => _fieldState.Clear();

        public IReadOnlyList<HubUser> GetAllUsers() => _connectedUsers.ToList().AsReadOnly();

        public IReadOnlyList<string> GetAllUsersId() => _connectedUsers.Select(x => x.ConnectionId).ToList().AsReadOnly();

        public IReadOnlyList<DrawPointModel> GetAllPoint() => _fieldState.ToList().AsReadOnly();
    }
}
