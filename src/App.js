import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Lyric from 'lyric-parser'
const electron = window.require("electron")

const url = 'https://www.youtube.com/results?search_query=china+inflation';
const ytw='https://www.youtube.com/watch?v=';
const { remote,globalShortcut,app } = electron;
let win = window.require('electron').remote.getCurrentWindow()
win.setContentSize(500,38)
win.setSize(800,600)
//win.setPosition(0,0)
win.setSkipTaskbar(true)
win.setIgnoreMouseEvents(true, {forward: true})
win.setOpacity(1)
win.webContents.closeDevTools()
win.setAlwaysOnTop(true, 'screen');
//alert(JSON.stringify(win.getBounds()))
//win.setPosition(0,-38+20)
win.setMaximizable(false)
win.setResizable(true)
const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
const size = win.getSize()
let x = (width-win.getSize()[0])/2
let y = win.getSize()[1]
//win.setPosition(parseInt(x),-38+20)
//win.setPosition(parseInt(x),100)
win.center()

win.hookWindowMessage(512, (wParam,lParam) =>{
        var x = lParam[0]+256*lParam[1]; //& 0xFFFF;
        var y = lParam[2]+256*lParam[3];
        console.log('move:'+x+':'+y);
})

const getUrl=(id)=>{
	
	return 'https://www.youtube.com/embed/'+id+'?autoplay=1'
}
class Item extends Component {
	constructor(props){
		super(props)
		this.state = {name:'',cur:0,open:1}

	}
	componentDidMount(){
		this.timerID = setInterval(()=>this.tick(),1000)
		console.log('mounted')
	}
	componentWillUnmount(){
		clearInterval(this.timerID)
	}
	tick(){
		axios.get(`http://hq.sinajs.cn/list=${this.props.code}`).then(r=>{
			let arr = r.data.split('=')[1].split(',');
			this.setState({
				name:this.props.name||arr[0].substr(arr[0].length-2),
				open:arr[2],
				cur:arr[3],
				})
		})
		
	}
	
	//click = e =>{
		//e.preventDefault();
		//remote.getCurrentWindow().setSize(this.state.clientRect.width,20)
		//remote.getCurrentWindow().setOpacity(0.7)
		//mainProcess.setSize(document.body.scrollWidth,document.body.scrollHeight)
	//}

	
  render() {
	  let diff = this.state.cur-this.state.open;
	 
    return (

		<div style={{display:"inline-block"}}>
		<span>{this.state.name}</span>
		<span style={{paddingLeft:'5px',color:diff>0?'red':'green'}}>{(diff*100/this.state.open).toFixed(2)}%<b></b>
			
		</span>
		</div>
      
    );
  }
} 
class App extends Component {
	
  constructor(props){
	  super(props)
	  let id = 'jmI_3-YP0jc';
	  this.state = {curId:id,txt:'',nextId:'',url:getUrl(id),duration:1,curTime:0}
	  window.addEventListener('keyup', ()=>{
		  alert('ehlo')
	  }, true);
  }
	
  componentDidMount(){
	  axios.get(url,{headers:{}}).then(res=>{
		  
		  let ids = res.data.match(/watch\?v=.*?"/g).map(v=>v.replace(/watch\?v=/,'').replace(/"/,''))
		  this.setState({ids:ids})
	  }).catch(e=>{console.log(e)})
  }
  srtToLrc = data =>data.split('\n\n').map(v=>{let arr = v.split('\n');if(!arr||arr.length<3)return '';let result = new RegExp('(\\d{2}):(\\d{2}):(\\d{2}),(\\d{2})').exec(arr[1]);return result?`[${result[2]}:${result[3]}.${parseInt(result[4]*10/10)}]${arr.slice(2).join(' ')}`:''}).join('\n')
	  
  onLoad = ()=>{
	  let subbase='http://downsub.com/';
	  axios.get(`${ytw}${this.state.curId}`).then(res=>{
		  let first = res.data.split('watchNextEndScreenRenderer')[1].match(/"videoId":".*?"/)[0]
		  let firstID = first.replace('"videoId":"','').replace('"','');
		  
		  this.setState({nextId:firstID})
		  
	  })
	  
	  axios.get(`${subbase}?url=`+encodeURIComponent(`${ytw}${this.state.curId}`),{headers:{}}).then(res=>{
		  
		  let str = res.data.replace(/<b>/gi,'\n<b>').split('\n').filter(v=>v.indexOf('English')>0)[0]
		  
		  let sub  = str.match(/\/index.php.*?"/)[0].replace(/"/g,"");
		  let suburl = `${subbase}`+sub;
		  axios.get(suburl,{headers:{}}).then(r=>{
			  console.log(r.data)
			const handler = ({lineNum, txt})=>{
				   // this hanlder called when lineNum change
				   let tag = document.createElement('div');
				   tag.innerHTML = txt; 
				   txt = tag.innerText;
				   //console.log(`${lineNum}:${txt}`)
				   this.setState({txt:txt.toLowerCase()});
			}
			 console.log(this.srtToLrc(r.data))
			 let lyric = new Lyric(this.srtToLrc(r.data), handler);
			 lyric.togglePlay();
			
	  setTimeout(()=>{
		  
		  const v = document.querySelectorAll('iframe')[0].contentDocument.querySelectorAll('video')[0];
		v.ontimeupdate= ()=>{
			let t=v.currentTime;
			this.setState({curTime:t*1000,duration:v.duration*1000})
			lyric.seek(t*1000)
			//lyric.togglePlay()
			//console.log(t);
		}
		v.onended=()=>{
			this.setState({curId:this.state.nextId,url:getUrl(this.state.nextId),txt:'loading '+this.state.nextId})
		}
		
	  },1000)
	  
		  })
	  }).catch(e=>{
		  console.log(e)
		  alert('error')
	  });

  }

  onLoad2 = ()=>{
	  setTimeout(()=>{
		//alert(document.querySelectorAll('iframe')[1].contentDocument.querySelectorAll('body')[0].innerHTML)

	  },3000)
  }
  mouseEnter() {
    console.log('mouse enter')
	win.setIgnoreMouseEvents(true, {forward: true})

	//win.setResizable(false)
}

mouseLeave() {
    console.log('mouse leave')
	win.setIgnoreMouseEvents(false)
}
  render() {
    return (
	  <div    onKeyDown={(event)=>{alert(event)}} 
	  tabIndex="0"  onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave} className="App" 
	  style={{fontSize:"16px",color:"green",position:"absolute",top:0,right:0,bottom:0,left:0}}>
	  <div style={{display:"inline-block"}}>
	  <span 
	  dangerouslySetInnerHTML={{ __html: this.state.txt }}></span>
	  <span>({(this.state.curTime/1000).toFixed(0)} 
	  - {(this.state.duration/1000).toFixed(0)})s
	  </span>
	  </div>
	  <span style={{webkitAppRegion:"drag",webkitUserSelect: "none"}} ><Item code="sh000001" name=" " /></span>
	  <div>
	  
	  
	  
	  
	  
	  
	  
	  
	  
	  
<iframe key={this.state.curId} onLoad={this.onLoad} width="100%" height="0" src={this.state.url} frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<iframe key={'u'} onLoad={this.onLoad2} width="100%" height="0" src={'https://www.youtube.com/results?sp=EgIIAg%253D%253D&search_query=china'} frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
	  </div>
      </div>
    );
  }
}
//document.querySelectorAll('iframe')[0].contentDocument.querySelectorAll('video')[0].duration
//document.querySelectorAll('iframe')[0].contentDocument.querySelectorAll('video')[0].currentTime
export default App;
