import * as React from "react";
import * as io from "socket.io-client";
import { characters } from '../../data'; 

const CANVAS_ID = 'z-desktop-gameboard-canvas-id';
const gameover_img = require("../../../src/assets/img/game-over.png");
const wizard = require("../../../src/assets/img/wizard-v2.png");
const bean0 = require("../../../src/assets/img/pinto-zombie.png");
const bean1 = require("../../../src/assets/img/red-zombie.png");
const bean2 = require("../../../src/assets/img/chickpea.png");
const bean3 = require("../../../src/assets/img/coffee.png");
const bean4 = require("../../../src/assets/img/edamame.png");

export
namespace GameBoard {

  export
  interface IProps {
    room_code: string;
  }

  export
  interface IState {
    board_description?: BoardDescription,
    player_descriptions: Map<string, PlayerDescription>;
    game_over: boolean;
    winner: "normal" | "zombies" | "none";
  }

  export
  interface BoardDescription {
    width: number;
    height: number;
    player_radius: number;
  }

  export
  interface PlayerRenderData {
    position: { x: number, y: number };
    isZombie: boolean;
  }

  export
  interface PlayerDescription {
    user_name: string;
    character: number;
  }

  
}

export
class GameBoard extends React.Component<GameBoard.IProps, GameBoard.IState> {

  private _socket: SocketIO.Socket;
  private _canvas?: React.RefObject<HTMLCanvasElement>;
  private _allZombieImages: Promise<{
    normal: HTMLImageElement[],
    zombie: HTMLImageElement[],
  }>;
  private _player_render_data: Map<string, GameBoard.PlayerRenderData>;

  constructor(props: any) {
    super(props);
    this._socket = io('/viewer');

    this._onGameStarting = this._onGameStarting.bind(this);
    this._onGameOver = this._onGameOver.bind(this);
    this._onGameTick = this._onGameTick.bind(this);
    this._onGameViewResponse = this._onGameViewResponse.bind(this);

    this._allZombieImages = Promise.all([
      this._allCharacterPromises(false),
      this._allCharacterPromises(true)]).then(values => {
        return {
          normal: values[0],
          zombie: values[1]
        }
      })

    this._player_render_data = new Map();

    this.state = {
      board_description: null,
      player_descriptions: new Map(),
      game_over: false,
      winner: "none"
    };

    this._canvas = React.createRef();
    this.animate = this.animate.bind(this);
  }

  private _allCharacterPromises(zombie: boolean): Promise<HTMLImageElement[]> {
    var promises = Array();
    for (var i = 0; i < characters.length; i++) {
      if (zombie) {
        promises.push(this._promiseImage(characters[i].zombie_img));
      } else {
        promises.push(this._promiseImage(characters[i].normal_img));
      }
    }

    return Promise.all(promises);
  }

  private _promiseImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject('Image failed to load');
      img.src = path;
    })
  }

  private _onGameOver(data: any): void {
    this.setState({
      game_over: true,
      winner: data['winner']
    })
  }

  private _onGameStarting(data: any): void {

  }

  private _onGameTick(data: any): void {
    let player_render_data: Map<string, GameBoard.PlayerRenderData> = data['player_pos_data'];
    this._player_render_data = player_render_data;
  }

  private _onGameViewResponse(data: any): void {
    if (data['view_status'] == 'success') {
      let player_raw_descriptions: Array<{
        user_name: string;
        character: number;
        player_id: string;
      }> = data['aux_data']['current_players'];
      let board_description: GameBoard.BoardDescription = data['aux_data']['board_description'];

      let player_descriptions = player_raw_descriptions.reduce(function(map, obj) {
        map[obj.player_id] = {
          user_name: obj.user_name,
          character: obj.character
        };
        return map;
      }, new Map<string, GameBoard.PlayerDescription>());

      this.setState({
        board_description,
        player_descriptions
      });

      this._allZombieImages.then(loaded_characters => {
        this.animate(loaded_characters, board_description.width, board_description.height);
      })
    } else {
      console.warn(`Failed to request view access to room: ${this.props.room_code}`);
    }
  }

  componentDidMount() {
    this._socket.on('game_starting', this._onGameStarting);
    this._socket.on('game_over', this._onGameOver);
    this._socket.on('game_tick', this._onGameTick);
    this._socket.on('game_view_response', this._onGameViewResponse);

    this._socket.emit("request_game_view", {
      "room_code": this.props.room_code
    })
  }

  animate(loaded_characters: {
    normal: HTMLImageElement[],
    zombie: HTMLImageElement[],
  }, width: number, height: number) {
    if (this && this._canvas && this.state.board_description) {
      if (this._canvas.current) {
        const canvas = this._canvas.current;
        const ctx = canvas.getContext('2d');

        let player_ids = Array();
        let characters = new Map();
        Object.keys(this.state.player_descriptions).map( key => {
          player_ids.push(key);
          characters[key] = this.state.player_descriptions[key].character;
        });

        draw(ctx, player_ids, characters, this.state.board_description, this._player_render_data, loaded_characters);
      }
    }

    if (this) {
      requestAnimationFrame(() => this.animate(loaded_characters, width, height));
    }
  }

  private _getHeightWidth() {
    let height: number;
    let width: number;
    if (this.state.board_description) {
      height = this.state.board_description.height;
      width = this.state.board_description.width;
    } else {
      height = 1200;
      width = 1200
    }

    return [width, height];
  }

  render() {
    let [width, height] = this._getHeightWidth();

    let inner_html: JSX.Element;
    if (!this.state.game_over) {
      inner_html = <canvas className={'z-desktop-gameboard-canvas'} ref={this._canvas} id={CANVAS_ID} height={height} width={width}/>;
      
    } else {
      let win_text: string;
      if (this.state.winner == 'normal') {
        win_text = "The uninfected beans managed to survive and find a cure!";
      } else if (this.state.winner == 'zombies') {
        win_text = "The zombies won, and the bean-citizen got to have a taste of bean-brains.";
      } else {
        win_text = "Nobody won! Something probably went wrong, please contact customer support.";
      }

      inner_html = (
        <div className={'z-desktop-gameover-text'}>
          <img src={gameover_img} className={'z-desktop-gameover-logo'}/>
          <p>{win_text}</p>
          <div className={'characters'}>
            <img className={'char-1'} src={wizard}/>
            <img className={'char-2'} src={bean0}/>
            <img className={'char-big'} src={bean1}/>
            <img className={'char-3'} src={bean2}/>
            <img className={'char-3'} src={bean3}/>
            <img className={'char-3'} src={bean4}/>
          </div>
        </div>
      );
    }

    return (
      <div className={'z-desktop-gameboard transition-item'}>
        {inner_html}
      </div>);
  }
}

function draw(ctx: CanvasRenderingContext2D, player_ids: Array<string>, characters: Map<string, number>, 
  board: GameBoard.BoardDescription, players: Map<string, GameBoard.PlayerRenderData>,
  loaded_characters: {
    normal: HTMLImageElement[],
    zombie: HTMLImageElement[],
  })
{
  ctx.save();

  ctx.clearRect(0, 0, board.width, board.height);

  for (let p_id of player_ids) {
    let player: GameBoard.PlayerRenderData = players[p_id];
    let character: number = characters[p_id];

    if (player) {
      let character_img;
      if (player.isZombie) {
        character_img = loaded_characters.zombie[character];
      } else {
        character_img = loaded_characters.normal[character];
      }
      
      drawPlayer(ctx, player.position.x, player.position.y, character,
        player.isZombie, board.player_radius, character_img);
    }
  }

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, character: number,
  is_zombie: boolean, radius: number, img: HTMLImageElement) {
  ctx.save();

  ctx.drawImage(img, x - (radius), y - (radius), 2 * radius, 2 * radius);
  
  ctx.restore();
}
