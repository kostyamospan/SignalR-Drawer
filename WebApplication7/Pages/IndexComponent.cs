using Blazor.Extensions;
using Blazor.Extensions.Canvas.Canvas2D;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication7.Models;

namespace Drawer.Pages
{
    public class IndexComponent : ComponentBase
    {
        private Canvas2DContext _context;

        protected BECanvasComponent CanvasComponent;

        private HashSet<DrawPointModel> _points = new HashSet<DrawPointModel>();

        private float _cellSize { get; set; } = 0;

        [Parameter]
        public float CanvasSideSize { get; set; } = 0;

        [Parameter]
        public int LinesCount { get; set; } = 0;

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            _context = await CanvasComponent.CreateCanvas2DAsync();
            _cellSize = CanvasSideSize / LinesCount;

            await CanvasLineUp();
        }


        private async Task DrawPoint(DrawPointModel point)
        {
            var xAbs = point.X;
            var yAbs = point.Y;
            var color = point.Color;

            await _context.SetFillStyleAsync("black");

            var canvasXPos = (xAbs * this.CanvasComponent.Width) / this._cellSize;
            var canvasYPos = (yAbs * this.CanvasComponent.Height) / this._cellSize;

            await _context.FillRectAsync(
                canvasXPos * _cellSize,
                canvasYPos * _cellSize,
                _cellSize,
                _cellSize
            );

        }

        public async Task AddManyPoints(IEnumerable<DrawPointModel> points)
        {
            foreach (var p in points)
            {
                await AddPoint(p);
            }
        }

        public async Task AddPoint(DrawPointModel point)
        {
            if (!_points.Contains(point))
            {
                _points.Add(point);
                await DrawPoint(point);
            }
        }

        public async Task CanvasLineUp()
        {
            var step = _cellSize;

            for (float x = 0; x < CanvasSideSize; x += step)
            {
                await _context.BeginPathAsync();
                await _context.MoveToAsync(x, 0);
                await _context.LineToAsync(x, this.CanvasSideSize);
                await _context.StrokeAsync();
            }

            for (float y = 0; y < CanvasSideSize; y += step)
            {
                await _context.BeginPathAsync();
                await _context.MoveToAsync(0, y);
                await _context.LineToAsync(this.CanvasSideSize, y);
                await _context.StrokeAsync();
            }
        }

        public async Task Clear()
        {
            await this._context.ClearRectAsync(0, 0, this.CanvasComponent.Width, this.CanvasComponent.Height);
            await this.CanvasLineUp();
        }
    }
}
