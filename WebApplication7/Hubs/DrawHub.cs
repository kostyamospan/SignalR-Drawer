using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using WebApplication7.Models;
using WebApplication7.Services;
using System.Text.Json;

namespace WebApplication7.Hubs
{
    public class DrawHub : Hub
    {
        private static readonly Dictionary<string, DrawRoom> _rooms = new Dictionary<string, DrawRoom>();

        private int RoomsCount { get => _rooms.Count; }

        public async void AddPoint(string drawPoint)
        {
            await Clients.All.SendAsync("drawPoint", drawPoint);
        }

        public async void ClearDrawer(string roomId)
        {
            DrawRoom room;

            if (!_rooms.TryGetValue(roomId ?? "", out room))
                return;

            var allUsers = room.GetAllUsers();

            await Clients.Clients(allUsers).SendAsync("clearDrawer");
        }

        public async void  UpdateClients(string roomId, string data)
        {
            DrawRoom room;

            if (!_rooms.TryGetValue(roomId ?? "", out room))
                return;

            var allUsers = room.GetAllUsers();

            await Clients.Clients(allUsers).SendAsync("updateClient",data );

            //await Clients.Users(allUsers).SendAsync("updateClient",data );
        }

        public string CreateRoom(string msg)
        {
            string id = RoomIdGenerator.GenerateId();

            DrawRoom newRoom = new DrawRoom(id);

            _rooms.Add(id, newRoom);

            newRoom.AddUser(Context.ConnectionId);

            return id;
        }

        public string ConnectToRoom(string roomId)
        {
            DrawRoom room;

            if (!_rooms.TryGetValue(roomId, out room))
                return null;

            room.AddUser(Context.ConnectionId);
            var roomUsers = room.GetAllUsers();

            return JsonSerializer.Serialize(roomUsers);
        }
    }
}
