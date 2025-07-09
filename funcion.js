class PaintApp {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.currentTool = "brush";
    this.currentColor = "#000000";
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.imageData = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupCanvas();
    this.updateCursor();
  }

  setupCanvas() {
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setupEventListeners() {
    // Eventos del canvas
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseout", () => this.stopDrawing());

    // Eventos de herramientas
    document.querySelectorAll(".tool-button").forEach((button) => {
      button.addEventListener("click", (e) => this.selectTool(e.target.id));
    });

    // Eventos de colores
    document.querySelectorAll(".color-button").forEach((button) => {
      button.addEventListener("click", (e) =>
        this.selectColor(e.target.dataset.color)
      );
    });

    // Eventos de acciones
    document
      .getElementById("clear")
      .addEventListener("click", () => this.clearCanvas());
    document
      .getElementById("save")
      .addEventListener("click", () => this.saveImage());

    // Tooltips
    document.querySelectorAll("[title]").forEach((element) => {
      element.addEventListener("mouseenter", (e) => this.showTooltip(e));
      element.addEventListener("mouseleave", () => this.hideTooltip());
    });
  }

  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    if (this.currentTool === "brush" || this.currentTool === "eraser") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
    } else {
      this.imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    this.ctx.lineWidth = this.currentTool === "eraser" ? 20 : 2;
    this.ctx.globalCompositeOperation =
      this.currentTool === "eraser" ? "destination-out" : "source-over";
    this.ctx.strokeStyle = this.currentColor;

    switch (this.currentTool) {
      case "brush":
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        break;

      case "eraser":
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        break;

      case "line":
        this.ctx.putImageData(this.imageData, 0, 0);
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        break;

      case "rectangle":
        this.ctx.putImageData(this.imageData, 0, 0);
        this.ctx.strokeRect(
          this.startX,
          this.startY,
          currentX - this.startX,
          currentY - this.startY
        );
        break;

      case "circle":
        this.ctx.putImageData(this.imageData, 0, 0);
        const radius = Math.sqrt(
          Math.pow(currentX - this.startX, 2) +
            Math.pow(currentY - this.startY, 2)
        );
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;
    }
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
    this.ctx.globalCompositeOperation = "source-over";
  }

  selectTool(toolId) {
    document
      .querySelectorAll(".tool-button")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(toolId).classList.add("active");
    this.currentTool = toolId;
    this.updateCursor();
    this.updateToolInfo();
  }

  selectColor(color) {
    document
      .querySelectorAll(".color-button")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-color="${color}"]`).classList.add("active");
    this.currentColor = color;
    this.updateColorInfo();
  }

  updateCursor() {
    this.canvas.className = `cursor-${this.currentTool}`;
  }

  updateToolInfo() {
    const toolNames = {
      brush: "Pincel",
      line: "Línea",
      rectangle: "Rectángulo",
      circle: "Círculo",
      eraser: "Borrador",
    };
    document.getElementById("current-tool").textContent =
      toolNames[this.currentTool];
  }

  updateColorInfo() {
    const colorNames = {
      "#000000": "Negro",
      "#ff0000": "Rojo",
      "#0000ff": "Azul",
      "#00ff00": "Verde",
      "#ffff00": "Amarillo",
      "#ff8800": "Naranja",
      "#8800ff": "Morado",
      "#8b4513": "Café",
    };
    document.getElementById("current-color").textContent =
      colorNames[this.currentColor];
  }

  clearCanvas() {
    if (confirm("¿Estás seguro de que quieres limpiar el canvas?")) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  saveImage() {
    const link = document.createElement("a");
    link.download = `paint-web-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
  }

  showTooltip(e) {
    const tooltip = document.getElementById("tooltip");
    tooltip.textContent = e.target.getAttribute("title");
    tooltip.style.opacity = "1";
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY - 40 + "px";
    e.target.removeAttribute("title");
  }

  hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.opacity = "0";
  }
}

// Inicializar la aplicación cuando se carga la página
window.addEventListener("DOMContentLoaded", () => {
  new PaintApp();
});
