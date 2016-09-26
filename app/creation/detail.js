/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var Video = require('react-native-video').default;



var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var Dimensions = React.Dimensions; //获取显示器的宽度
var ActivityIndicatorIOS = React.ActivityIndicatorIOS; //进度条组件
var TouchableOpacity= React.TouchableOpacity; //暂停组件


var width = Dimensions.get('window').width;
//账户页面
var Detail = React.createClass({

    getInitialState(){
        var data = this.props.data;
        return {
            data:data,      //父级上传递过来的资源
            videoOk:true, //视频是否准备好
            videoLoaded:false, //视频读取好没
            playing:false , //是否正在播放
            paused:false, //是否暂停

            videoProgress:0.01, //获取之间比
            videoTotal: 0, //时间总长度
            currentTime: 0, //现在的时间

            rate:1, //速度为正常
            muted:false, //不消除声音
            resizeMode:'contain', //居中显示
            repeat:false //不重复播放
        }
    },
    _onLoadStart(){
        console.log('load start')
    },
    _onLoad(){
        console.log('load _onLoad')
    },
    //读取结束后开始运行
    _onProgress(data){
        //data是获取的数据
        if (!this.state.videoLoaded){
            this.setState({
                videoLoaded:true
            })
        }

        var duration = data.playableDuration; //获取视频播放长度
        var currentTime = data.currentTime; //获取现在播放的时候
        var percent = Number((currentTime/duration).toFixed(2)); //获取之间比,精确到小数点后两位
        var newState = {
            videoTotal:duration, //时间总长度
            currentTime:Number(data.currentTime.toFixed(2)), //现在的时间
            videoProgress:percent //获取之间比
        };

        if (!this.state.videoLoaded){
            newState.videoLoaded = true
        }
        if (!this.state.playing){
            newState.playing = true
        }

        this.setState(newState); //讲数据放进启动项

        console.log(data);
        console.log('load _onProgress')
    },
    _onEnd(){
        this.setState({
            videoProgress:1, //视频精度条
            playing:false
        });
        console.log('load _onEnd')
    },
    _onError(e){
        this.setState({
            videoOk:false
        });

        console.log(e)
        console.log('load _onError')
    },

    //回到父级容器的方法
    _backToList(){
      this.props.navigator.pop();
    },
    //重播方法
    _replay(){
        this.refs.videoPlayer.seek(0)
    },
    //暂停方法
    _pause(){
        if (!this.state.paused){
            this.setState({
                paused:true
            })
        }

    },
    //开始
    _resume(){

        if (this.state.paused){
            this.setState({
                paused:false
            })
        }
    },

    render: function(){
        var data = this.props.data; //获取到父级传递来的数据
        console.log(data);
        return (
            <View style={styles.container}>
                <Text onPress={this._backToList}>详情页面{data._id}</Text>
                <View style={styles.videoBox}>
                    <Video
                        ref="videoPlayer" //播放名称
                        source={{uri:data.video}} //播放的数据
                        style={styles.video}   //播放器的样式
                        volume={1} //播放的声音大小
                        paused={this.state.paused} //暂停
                        rate={this.state.rate} //速度
                        muted={this.state.muted} //消除声音
                        resizeMode={this.state.resizeMode} //模型样式
                        repeat={this.state.repeat}  //重复播放

                        onLoadStart={this._onLoadStart} //开始
                        onLoad={this._onLoad} //读取数据
                        onProgress={this._onProgress}   //读取数据完成 播放
                        onEnd={this._onEnd} //播放结束
                        onError={this._onError} //播放过程中错误
                    />

                    {/*出错时*/}
                    {
                        !this.state.videoOk && <Text style={styles.failText}>视频出错了!很抱歉</Text>
                    }
                    {/*显示进度条 里面的数据已经定义了 时间比是关键*/}
                    {
                        !this.state.videoLoaded && <ActivityIndicatorIOS
                            color='#ee735c'
                            style={styles.loading}/>
                    }
                    {/*显示重复播放,在播放结束后*/}
                    {
                        this.state.videoLoaded && !this.state.playing
                        ? <Icon onPress={this._replay} name='ios-play' size={48} style={styles.playIcon} />

                        :
                            null
                    }
                    {/*暂停的功能*/}
                    {
                        this.state.videoLoaded && this.state.playing
                        ?
                            <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
                                {
                                    this.state.paused
                                    ? <Icon size={48} onPress={this._resume} name="ios-play" style={styles.resumeIcon}/>
                                    : <Text></Text>
                                }
                            </TouchableOpacity>
                        :
                            null
                    }

                    <View style={styles.progressBox}>
                        <View style={[styles.progressBar,{width:width * this.state.videoProgress}]}>

                        </View>
                    </View>

                </View>
            </View>
        )
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    videoBox:{
        width:width,
        height:360,
        backgroundColor:'#000'
    },
    video:{
        width:width,
        height:360,
        backgroundColor:'#000'
    },
    loading:{
        position:'absolute',
        left: 0,
        top:140,
        width:width,
        alignSelf:'center',
        backgroundColor:'transparent'
    },
    progressBox:{
        width:width,
        height:2,
        backgroundColor:'#ccc'

    },
    progressBar:{
        width:1,
        height:2,
        backgroundColor:'#ff6600'
    },

    playIcon:{
        position:'absolute',
        top:140,
        left:width/2 -30,
        height:60,
        width:60,
        paddingTop:8,
        paddingLeft:22,
        backgroundColor:'transparent',
        borderColor:'#fff',
        borderWidth:1,
        borderRadius: 30,
        color:'#ed7b66'
    },
    pauseBtn:{
        width:width,
        height:360,
        position:'absolute',
        left:0,
        top:0
    },
    resumeIcon:{
        position:'absolute',
        top:140,
        left:width/2 -30,
        height:60,
        width:60,
        paddingTop:8,
        paddingLeft:22,
        backgroundColor:'transparent',
        borderColor:'#fff',
        borderWidth:1,
        borderRadius: 30,
        color:'#ed7b66'
    },

});

module.exports = Detail;