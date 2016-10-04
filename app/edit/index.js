/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var Video = require('react-native-video').default;
var ImagePicker = require('NativeModules').ImagePickerManager;

var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var Image = React.Image;
var TouchableOpacity = React.TouchableOpacity;
var Dimensions = React.Dimensions;


var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

var videoOptions = {
  title: '选择视频',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '录制10s视频',
  chooseFromLibraryButtonTitle: '选择已有视频',
  videoQuality:'medium',
  mediaType:'video',
  durationLimit: 10, //录制时控制多少秒
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

//制作视频页面
var Edit = React.createClass({

    getInitialState(){
        return{
          previewVideo: null,

          //视频进度条的
          videoOk:true, //视频是否准备好
          videoLoaded:false, //视频读取好没
          playing:false , //是否正在播放
          paused:false, //是否暂停
          videoProgress:0.01, //获取之间比
          videoTotal: 0, //时间总长度
          currentTime: 0, //现在的时间

          //视频播放的
          rate:1, //速度为正常
          muted:true, //是否消除声音
          resizeMode:'contain', //居中显示
          repeat:false //不重复播放
        }
    },

  _onLoadStart(data){
    console.log('load start')
  },
  _onLoad(data){
    console.log('_onLoad')
  },
  _slider(){

  },
  //读取结束后开始运行
  _onProgress(data){
    console.log(data)
    console.log('load _onProgress')
    //data是获取的数据
    if (!this.state.videoLoaded){
      this.setState({
        videoLoaded:true
      })
    }

    var duration = data.target; //获取视频播放长度
    //console.log(data);
    var currentTime = data.currentTime; //获取现在播放的时候
    var percent = Number((currentTime/duration).toFixed(2)); //获取之间比,精确到小数点后两位
    var newState = {
      videoTotal:duration, //时间总长度
      currentTime:Number(data.currentTime.toFixed(2)), //现在的时间
      videoProgress:percent, //获取之间比
      value:percent
    };

    if (!this.state.videoLoaded){
      newState.videoLoaded = true
    }
    if (!this.state.playing){
      newState.playing = true
    }
    this.setState(newState); //讲数据放进启动项
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

  _pickVideo(){

    var that = this;
    ImagePicker.showImagePicker(videoOptions, (res) => {

      if (res.didCancel) {
        return;
      }

      var uri = res.uri;

      that.setState({
        previewVideo:uri
      });

      // that._getQiniuToken()
      //   .then((data) =>{
      //
      //     if (data && data.success) {
      //
      //       var token = data.data.token;
      //       var key = data.data.key;
      //
      //       var body = new FormData();
      //
      //       body.append('token', token);
      //       body.append('key', key);
      //       body.append('file', {
      //         type:'image/jpeg',
      //         uri:uri,
      //         name:key
      //       });
      //
      //       that._upload(body)
      //     }
      //
      //   });

    });
  },

    render: function(){
        return (
            <View style={styles.container}>
              <View style={styles.toolbar}>
                <Text style={styles.toolbarTitle}>
                  {this.state.previewVideo ? '点击按钮配音' : '理解动漫,从配音开始'}
                </Text>
                <Text style={styles.toolbarExtra} onPress={this._pickVideo}>更换视频</Text>
              </View>

              <View style={styles.page}>
                { this.state.previewVideo
                  ? <View style={styles.videoContainer}>
                      <View style={styles.videoBox}>
                        <Video
                          ref="videoPlayer" //播放名称
                          source={{uri:this.state.previewVideo }} //播放的数据
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
                      </View>
                    </View>
                  : <TouchableOpacity
                    style={styles.uploadContainer}
                    onPress={this._pickVideo}
                    >
                      <View style={styles.uploadBox}>
                        <Image style={styles.uploadIcon} source={require('../assets/images/react.png')} />
                        <Text style={styles.uploadTitle}>点我上传视频</Text>
                        <Text style={styles.uploadDesc}>建议时长不超过20秒</Text>
                      </View>
                    </TouchableOpacity>
                }
              </View>

            </View>
        )
    }
});


var styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  toolbar: {
    flexDirection: 'row',
    padding: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c'
  },
  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  },
  toolbarExtra: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14
  },
  page:{
    flex:1,
    alignItems:'center'
  },
  uploadContainer:{
    marginTop:90,
    width:width -40,
    paddingBottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    justifyContent:'center',
    borderRadius:6,
    backgroundColor:'#fff'
  },
  uploadTitle:{
    textAlign:'center',
    marginBottom:10,
    fontSize:16,
    color:'#000'
  },
  uploadDesc:{
    color:'#999',
    textAlign:'center',
    fontSize:12
  },
  uploadIcon:{
    width:100,
    height:150,
    resizeMode:'contain'
  },
  uploadBox:{
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  videoContainer:{
    width:width,
    justifyContent:'center',
    alignItems:'flex-start'
  },
  videoBox:{
    width:width,
    height:height*0.6,
  },
  video:{
    width:width,
    height:height * 0.6,
    backgroundColor:'#333'
  }





});

module.exports = Edit;