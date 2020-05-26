import React, { Component } from 'react';

class Game extends Component {
  state = {
    gravity: 0.8,
    lift: -15,
    bird: {
      x: 50,
      y: 100,
      velocity: 0,
      radius: 20
    }
  }

  draw = () => {
    const ctx = this.refs.canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.refs.canvas.width,
      this.refs.canvas.height);
    ctx.beginPath();
    ctx.arc(this.state.bird.x, this.state.bird.y,
      this.state.bird.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  update = () => {
    let newV = (this.state.bird.velocity + this.state.gravity) * 0.9
    this.setState({
      bird: {
        x: 50,
        y: Math.max(
          Math.min(
            this.state.bird.y + newV,
            this.refs.canvas.height - this.state.bird.radius
          ),
          0
        ),
        velocity: newV,
        radius: 20
      }
    });
  }
  componentDidMount() {
    setInterval(() => {
      this.update();
      this.draw();
    }, 1000 / 60);
    document.addEventListener("keydown", e =>
      e.keyCode === 32 ? this.setState({
        bird: {
          x: 50,
          y: this.state.bird.y,
          velocity: this.state.bird.velocity + this.state.lift,
          radius: 20
        }
      }) : null
    );
  }

  render() {
    return (
      <div>
        <canvas ref="canvas" width={450} height={650} />
      </div>
    );
  }
}
export default Game;