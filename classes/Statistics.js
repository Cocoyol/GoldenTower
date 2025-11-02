/**
 * Clase para manejar las estadísticas del juego
 */
class Statistics {
    constructor() {
        this.projectileCount = 0;
        this.enemyCount = 0;
        this.collisionCount = 0;
        
        // Referencias a elementos DOM
        this.projectileElement = document.getElementById('projectileCount');
        this.enemyElement = document.getElementById('enemyCount');
        this.collisionElement = document.getElementById('collisionCount');
    }

    /**
     * Incrementa el contador de proyectiles
     */
    incrementProjectiles() {
        this.projectileCount++;
        this.updateDisplay();
    }

    /**
     * Incrementa el contador de enemigos
     */
    incrementEnemies() {
        this.enemyCount++;
        this.updateDisplay();
    }

    /**
     * Incrementa el contador de colisiones
     */
    incrementCollisions() {
        this.collisionCount++;
        this.updateDisplay();
    }

    /**
     * Actualiza la visualización de las estadísticas
     */
    updateDisplay() {
        if (this.projectileElement) {
            this.projectileElement.textContent = this.projectileCount;
        }
        if (this.enemyElement) {
            this.enemyElement.textContent = this.enemyCount;
        }
        if (this.collisionElement) {
            this.collisionElement.textContent = this.collisionCount;
        }
    }

    /**
     * Resetea todas las estadísticas
     */
    reset() {
        this.projectileCount = 0;
        this.enemyCount = 0;
        this.collisionCount = 0;
        this.updateDisplay();
    }
}
