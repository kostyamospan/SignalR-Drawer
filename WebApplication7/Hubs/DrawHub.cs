using Microsoft.AspNetCore.SignalR;

namespace WebApplication7.Hubs
{
    public class DrawHub : Hub
    {
        public async void AddPoint(string drawPoint)
        {
            await Clients.All.SendAsync("drawPoint", drawPoint);
        }
    }
}
