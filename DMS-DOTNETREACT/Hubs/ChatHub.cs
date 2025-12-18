using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user:{userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public Task JoinConversation(int conversationId)
        => Groups.AddToGroupAsync(Context.ConnectionId, $"conv:{conversationId}");

    public Task LeaveConversation(int conversationId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv:{conversationId}");
}
