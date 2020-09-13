import React, {Component} from "react";
import "./timer.css";
import teddyAlarm from "./teddy_alert.mp3";

export default class Timer extends Component {
  state = {
    from: 4,                 // countdown time
    interval: 100,           // interval
    beginDate: Date.now(),   // begin Date.now()
    autoStart: false,
    infinity: true,          // infinity circle
    pause: false,            // paused State
    action: false,           // is timer work?
    waitingDate: 0,          // paused Date
    electron: '00',
    startButton: 'Start',
    intervalID: 0,           // global Timer callback
    circleSVG: {
      strokeDashoffset: "0",
      strokeDasharray: 2 * Math.PI * 100
    },
  };

  componentDidMount = () => {
    this.setState({from: this.props.from});
    this.setState({interval: this.props.interval});
    this.setState({infinity: this.props.infinity});
    this.setState({autoStart: this.props.autoStart});
    this.calcElectron(this.props.from);
    if (this.props.autoStart) this.initClock();
  };

  componentWillUnmount = () => {
    clearInterval(this.intervalID);
    this.setState({action: false});
  };

  onTimeEnd= () => console.log("Час вийшов!");
  onTimeStart=() => console.log("Таймер запущено!");
  onTimePause=() => console.log("Таймер на паузі!");

  initClock = async () => {
    if (this.state.action && !this.state.pause) {  // resume start
      this.onTimePause()
      await this.setState({waitingDate: Date.now()});
      await this.setState({startButton: "Start"});
      await this.setState({pause: true});
      clearInterval(this.state.intervalID);
    } else {
      if (this.state.action && this.state.pause) {  // resume end
        await this.setState({waitingDate: Date.now() - this.state.waitingDate });
        await this.setState({beginDate: this.state.beginDate + this.state.waitingDate });
        await this.setState({waitingDate: 0 });
        await this.setState({startButton: "Pause"});
        await this.setState({pause: false});
      } else { // init
          this.onTimeStart();
          await this.setState({beginDate: Date.now()});
          await this.setState({startButton: "Pause"});
          await this.setState({action: true});
          await this.setState({pause: false});
          await this.setState({circleSVG: {strokeDashoffset: 0}});
        }
      this.setState({
        intervalID: setInterval(async () => {
          this.calcElectron();
          const curTime = Date.now() - this.state.beginDate;
          if (curTime > this.state.from * 1000) {
            this.onTimeEnd();
            if (this.state.infinity) {
               this.setState({beginDate: Date.now()});
               this.setState({pause: 0});
               this.setState({circleSVG: {strokeDashoffset: 0}});
            } else {
               clearInterval(this.state.intervalID);
               this.setState({action: false});
               this.setState({startButton: 'Start'});
            }
            await this.blinkingElectron();
          }
        }, this.state.interval),
      });
    }
  };

  calcElectron = (init= undefined) => {        // calculated electronic digits & SVG
    let calcTime = init;
    let ele;
    let tempTime;
    if (!init) {
      tempTime = Date.now() - this.state.waitingDate - this.state.beginDate;
      calcTime = (this.state.from - tempTime / 1000).toFixed();
    }
    ele = (calcTime >= 10) ? calcTime.toString() : '0' + Math.abs(calcTime);
    if (this.state.action || init) this.setState({electron: ele});
      else this.setState({electron: '00'});

    const pos = (tempTime * 2 * Math.PI * 100 / this.state.from / 1000).toFixed();
    this.setState({circleSVG: {strokeDashoffset: pos}});
  };

  blinkingElectron = () => {
    let timer = 10;
    this.setState({electron: '00'});
    document.getElementById('alarm').currentTime = 0;
    document.getElementById('alarm').play();
    const blinkID = setInterval( () => {
      (() => {
        if (timer < 0) clearInterval(blinkID);
        if (timer % 2) this.setState({circleSVG: {strokeDashoffset: 0}})
        else this.setState({circleSVG: {strokeDashoffset: 2 * Math.PI * 100}});
        timer--;
      })();
    }, 100);
    this.calcElectron(this.state.from);
  }

  countDownButton = async(e) => {
    let checkValue = +e.target.value;
    if (checkValue > 99) checkValue = 99;
    if (checkValue < 1) checkValue = 1;
    await this.setState({from: checkValue});
    this.calcElectron(this.state.from);
  };

  intervalButton = async (e) => {
    let checkValue = +e.target.value;
    if (checkValue > 9999) checkValue = 9999;
    if (checkValue < 1) checkValue = 1;
    await this.setState({interval: checkValue});
  };

  render() {
    return (
      <div className="bg">
        <div className="container">
          <div className="count-down">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
              <circle className="stroke"
                      cx="110" cy="110" r="100"
                      style={this.state.circleSVG}
              />
            </svg>
            <span className="digits">88</span>
            <span className="digits-overlay" onClick={this.out}>
              {this.state.electron}
            </span>
            <label className="inputCD">
              Timer (s):<br/>
              <input id="countDown_btn" type="number" min="1" max="99"
                     value={this.state.from}
                     onChange={this.countDownButton}>
              </input>
            </label>
            <label className="inputINT">
              Interval (ms):<br/>
              <input id="interval_btn" type="number" min="1" max="9999"
                     value={this.state.interval}
                     onChange={this.intervalButton}>
              </input>
            </label>
            <p className="auto_start">{this.state.autoStart ? 'autostart' : ''}</p>
            <p className="infinity">{this.state.infinity ? 'infinity' : ''}</p>
            <button className="start_btn" onClick={this.initClock}>
              {this.state.startButton}
            </button>
          </div>
          <audio id='alarm' preload='auto' src={teddyAlarm}></audio>
        </div>
      </div>
    );
  }
};


// Завдання Basic:
//   Ваше основне завдання у цій домашці: зробити таймер зворотнього відліку.
//   Компонент <Timer /> Приклад того, що має бути: https://www.youtube.com/watch?v=Mxo0RE_bJO4
// 1.	Таймер повинен отримувати props time – час, з якого починається відлік
// 2.	У таймера повинна бути кнопка start/pause. При натисканні на яку відповідно таймер або ставиться на паузу, або запускається знову
// 3.	Повинен бути props autostart автоматичного запуску. Якщо вказано true – таймер запускається сам. (componentDidMount може вам в цьому допомогти)
// 4.	В компонент <Timer onTick={(time) => console.log("Залишилось часу: " + time)} /> можна передавати функцію onTick, яка спрацьовує при кожному "тіку" таймера.
// 5.	Додайте props step, який дозволить передати інтервал оновлення таймера. Наприклад раз у 1 секунду/100 мс/2с/10с.
// Зверніть увагу на відео – нижній таймер змінюється кожні 2 секунди. Всі значення часу у таймера вказані в мс
// 6.	Довжина полоски зменшується з рухом таймера(анімацію раджу зробити потім окремо, вона в цьому завданні НЕОБОВЯЗКОВА)
//
//
// Завдання Advanced:
//   1.	Додайте подію onTimeEnd, передається як <Timer onTimeEnd={() => console.log("Час вийшов!")} />
// 2.	Додайте подію onTimeStart, передається як <Timer onTimeStart={(timeLeft) => console.log("Таймер запущено!")} />
// 3.	Додайте подію onTimePause, передається як <Timer onTimePause={(timeLeft) => console.log("Таймер на паузі!")} />
// 4.	*Завдання з зірочкою або навіть з кількома*
// Якщо змінюється зовнішній props time – ваш таймер повинен відреагувати.
//   Давайте розглянемо таку задачу.
//   У нас є компонент таймера (передбачається, що всі попередні пункти ДЗ виконано). Необхідно щоб він був нескінченним.
//   Як тільки час закінчиться – запускаемо таймер по новій. Нижче закріплено приклад використання такого таймеру з логікою.
//   Ваша задача допрацювати тільки компонент Timer.