import * as React from "react";

export
namespace MobileLanding {
  export
  interface IState {
    name: string;
    room_code: string;
  }
  export
  interface IProps {
    submit_form: (room_code: string, name: string) => void;
    room_code_failure: boolean,
    room_code_fail_reason: string
  }
}

export
class MobileLanding extends React.Component<MobileLanding.IProps, MobileLanding.IState> {
  constructor(props: MobileLanding.IProps) {
    super(props);

    this.state = {
      name: '',
      room_code: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleNameChange= this.handleNameChange.bind(this);
  }

  handleCodeChange(evt) {
    this.setState({room_code: evt.target.value});
  }

  handleNameChange(evt) {
    this.setState({name: evt.target.value});
  }

  handleSubmit(evt) {
    evt.preventDefault();
    this.props.submit_form(this.state.room_code, this.state.name);
  }

  render() {
    let fail_reason;
    if (this.props.room_code_failure) {
      fail_reason = (
        <div className='z-mobile-landing-failure'>
          <p>{this.props.room_code_fail_reason}</p>
        </div>
      )
    } else {
      fail_reason = null;
    }

    return (
      <div className='z-mobile-landing-page transition-item'>
        <div className={'z-mobile-landing-header-spacer'} />
        {fail_reason}
        <div className={'z-mobile-landing-form'} >
            <p>
              Room Code:
              <input value={this.state.room_code} onChange={this.handleCodeChange} type="text" />
            </p>
            <p>
              Username:
              <input value={this.state.name} onChange={this.handleNameChange} type="text" />
            </p>
          <button onClick={this.handleSubmit}>
            <p>Join</p>
          </button>
        </div>
      </div>
    );
  }
}