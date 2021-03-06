import * as React from "react";
import * as io from "socket.io-client";
import {IUser} from '../../types';

const rotate_phone = require("../../../src/assets/img/rotate-phone.png");
const god_img = require("../../../src/assets/img/wizard.png");

const FREEZE = 1
const SPEED_UP = 2
const IMMUNE = 3
const CURE = 4

export
namespace GodController {
  export
  interface IProps {
    user: IUser;
    room_code: string;
    on_press: (evt: any, type: number) => void;
    screen_orientation: 'vertical' | 'horizontal';
    enabled_spells: boolean[];
  }
}

export
class GodController extends React.Component<GodController.IProps, any> {
  render() {
    if (this.props.screen_orientation == 'vertical') {
      return (
        <div className="z-mobile-controller-page transition-item rotate">
          <img src={rotate_phone}/>
          <p>now, rotate your phone</p>
        </div>
      )
    }

    return (
      <div className='z-mobile-god-controller-page z-mobile-controller transition-item'>
        <div className='z-mobile-god-player'>
          <p className='players-name'>{this.props.user.name}</p>
          <img className='players-bean' src={god_img}/>
          <div id='oval' className='god'></div>
        </div>
        <GodButtons on_press={this.props.on_press} enabled={this.props.enabled_spells}/>
      </div>
    );
  }
}

export
namespace GodButtons {
  export
  interface IProps {
    on_press: (evt: any, type: number) => void;
    enabled: boolean[];
  }
}

const GodButtons = (props: GodButtons.IProps) => {
  return (
    <div className='z-mobile-god-buttons'>
      <button className='z-mobile-god-button button-1'
          onClick={(evt)=>props.on_press(evt, FREEZE)}
          disabled={!props.enabled[0]}
          onContextMenu={(evt)=>{evt.preventDefault(); evt.stopPropagation()}}>
        Freeze
      </button>
      <button className='z-mobile-god-button button-2'
          onClick={(evt)=>props.on_press(evt, SPEED_UP)}
          disabled={!props.enabled[1]}
          onContextMenu={(evt)=>{evt.preventDefault(); evt.stopPropagation()}}>
        Speed Up
      </button>
      <button className='z-mobile-god-button button-3'
          onClick={(evt)=>props.on_press(evt, IMMUNE)}
          disabled={!props.enabled[2]}
          onContextMenu={(evt)=>{evt.preventDefault(); evt.stopPropagation()}}>
        Immunity          
      </button>
      <button className='z-mobile-god-button button-4'
          onClick={(evt)=>props.on_press(evt, CURE)}
          disabled={!props.enabled[3]}
          onContextMenu={(evt)=>{evt.preventDefault(); evt.stopPropagation()}}>
        Cure                   
      </button>
    </div>
  )
}