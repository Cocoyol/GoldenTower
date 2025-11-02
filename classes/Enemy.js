/**
 * Clase que representa un enemigo (polígono irregular descendente)
 */
class Enemy {
    constructor(x, y, size = 30) {
        this.x = x;
        this.y = y;
        this.size = size;
        
        // Color gris
        this.color = ['#808080', '#A9A9A9', '#696969'][Utils.randomInt(0, 2)];
        
        // Generar polígono irregular (4-8 vértices)
        const sides = Utils.randomInt(4, 8);
        this.vertices = Utils.generateIrregularPolygon(
            sides,
            this.size * 0.7,
            this.size * 1.2,
            0,
            0
        );
        
        // Rotación
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Utils.random(-0.03, 0.03);
        
        // Velocidad descendente
        this.velocity = { x: 0, y: 0.5 };
        
        // Física
        this.physicsBody = null;
        
        // Estado
        this.isDestroyed = false;
    }

    /**
     * Crea el cuerpo físico del enemigo
     */
    createPhysicsBody(physicsManager) {
        // Convertir vértices locales a absolutos
        const absoluteVertices = this.vertices.map(v => ({
            x: this.x + v.x,
            y: this.y + v.y
        }));
        
        this.physicsBody = physicsManager.createEnemyBody(this.x, this.y, absoluteVertices);
    }

    /**
     * Actualiza el enemigo
     */
    update() {
        if (this.physicsBody) {
            // Sincronizar con el cuerpo físico
            this.x = this.physicsBody.position.x;
            this.y = this.physicsBody.position.y;
            this.rotation = this.physicsBody.angle;
        } else {
            // Movimiento simple sin física (backup)
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.rotation += this.rotationSpeed;
        }
    }

    /**
     * Dibuja el enemigo
     */
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Dibujar polígono irregular
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Verifica si está fuera del escenario
     */
    isOutOfBounds(width, height, buffer = 200) {
        return this.x < -buffer || this.x > width + buffer ||
               this.y < -buffer || this.y > height + buffer;
    }

    /**
     * Marca el enemigo como destruido
     */
    destroy() {
        this.isDestroyed = true;
    }
}
