using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using WebApplication7.Models;
using WebApplication7.Services;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;

namespace WebApplication7.Hubs
{
    public class DrawHub : Hub
    {
        private static readonly Dictionary<string, DrawRoom> _rooms = new Dictionary<string, DrawRoom>();

        private static readonly Dictionary<string, HubUser> _hubUsers = new Dictionary<string, HubUser>();

        private int RoomsCount { get => _rooms.Count; }

        public async void AddPoint(string drawPoint)
        {
            await Clients.All.SendAsync("drawPoint", drawPoint);
        }

        public override Task OnConnectedAsync()
        {
            return Task.Run(() =>
           {
               lock (_hubUsers)
               {
                   _hubUsers.Add(Context.ConnectionId, new HubUser(Context.ConnectionId));
               }
           });
        }

        public override Task OnDisconnectedAsync(System.Exception exception)
        {
            return Task.Run(async () =>
            {
                HubUser user;

                lock (_hubUsers)
                {
                    if (!_hubUsers.TryGetValue(Context.ConnectionId, out user))
                        return;
                }

                await OnUserLeaves(user);

                lock (_hubUsers)
                {
                    user.Room?.RemoveUser(user);
                    _hubUsers.Remove(user.ConnectionId);
                }

            });
        }

        public async void ClearDrawer(string roomId)
        {
            DrawRoom room;

            if (!_rooms.TryGetValue(roomId ?? "", out room))
                return;

            var allUsers = room.GetAllUsers();

            await Clients.Clients(room.GetAllUsersId()).SendAsync("clearDrawer");
        }

        public async void UpdateClients(string roomId, string data)
        {
            DrawRoom room;

            if (!_rooms.TryGetValue(roomId ?? "", out room))
                return;

            DrawPointModel point = JsonSerializer.Deserialize<DrawPointModel>(data);

            if (data is null) return;

            room.AddPointToField(point);

            await Clients.Clients(room.GetAllUsersId()).SendAsync("updateClient", data);
        }

        public string CreateRoom(string msg)
        {
            HubUser curUser;

            if (!_hubUsers.TryGetValue(Context.ConnectionId, out curUser))
            {
                curUser = new HubUser(Context.ConnectionId);
                _hubUsers.Add(curUser.ConnectionId, curUser);
            }

            string id = RoomIdGenerator.GenerateId();

            DrawRoom newRoom = new DrawRoom(id);

            _rooms.Add(id, newRoom);

            newRoom.AddUser(curUser);

            return id;
        }

        public async Task<string> ConnectToRoom(string roomId)
        {
            DrawRoom room;

            if (!_rooms.TryGetValue(roomId, out room))
                return null;

            HubUser user;

            if (!_hubUsers.TryGetValue(Context.ConnectionId, out user))
            {
                user = new HubUser(Context.ConnectionId);
                _hubUsers.Add(user.ConnectionId, user);
            }

            room.AddUser(user);
            user.Room = room;

            await OnUserConnected(user);

            return JsonSerializer.Serialize(new { connectedUsers = room.GetAllUsersId(), fieldState = room.GetAllPoint() });
        }


        private async Task OnUserLeaves(HubUser leavedUser)
        {
            var room = leavedUser.Room;

            if (room is null) return;

            await Clients.Clients(room.GetAllUsersId()).SendAsync(
                "onUserLeavesRoom",
                leavedUser.ConnectionId);
        }


        private async Task OnUserConnected(HubUser connUser)
        {
            if (connUser is null) return;

            var room = connUser.Room;

            if (room is null) return;

            await Clients.Clients(
                room.GetAllUsersId().Where( x=> x != connUser.ConnectionId).ToList().AsReadOnly()
                ).SendAsync(
                "onUserConnectToRoom",
                connUser.ConnectionId);
        }
    }
}
