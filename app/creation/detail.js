/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var Video = require('react-native-video').default;
var Button = require('react-native-button');

var request = require('../common/request');
var config = require('../common/config');


var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var ActivityIndicatorIOS = React.ActivityIndicatorIOS; //进度条组件
var TouchableOpacity= React.TouchableOpacity; //暂停组件
var Image = React.Image;
var ListView = React.ListView;
var TextInput = React.TextInput;
var Modal = React.Modal;
var AlertIOS = React.AlertIOS;
var SliderIOS = React.SliderIOS;
var Dimensions = React.Dimensions; //获取显示器的宽度

var width = Dimensions.get('window').width;

var cacheResults = {
    nextPage: 1,
    items:[],
    total: 0
};

//账户页面
var Detail = React.createClass({


    getInitialState(){
        var data = this.props.data;
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2
    });

        return {
            //数据的
            data:data,      //父级上传递过来的资源
            dataSource: ds.cloneWithRows([]), //获取到数据

            //视频进度条的
            videoOk:true, //视频是否准备好
            videoLoaded:false, //视频读取好没
            playing:false , //是否正在播放
            paused:false, //是否暂停
            videoProgress:0.01, //获取之间比
            videoTotal: 0, //时间总长度
            currentTime: 0, //现在的时间
            value:0.01,
            slider:false,

            //输入框的
            animationType: 'none', //浮层出现的形式
            modalVisible:false, //是否可见
            isSending:false, //是否发送出去
            content:'',

            //视频播放的
            rate:1, //速度为正常
            muted:false, //不消除声音
            resizeMode:'contain', //居中显示
            repeat:false //不重复播放
        }
    },
    _onLoadStart(data){
        console.log(data)
        console.log('load start')
    },
    _onLoad(data){
        console.log(data)
        if (!this.state.slider){
            data.currentTime = 17;
            console.log('ss');
        }
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

    //回到父级容器的方法
    _pop(){
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

    //页面加载后调用的方法
    componentDidMount(){
      this._fetchData();
    },

    _fetchData(page) {
        var that = this;


            this.setState({
                isLoadingTail: true
            });

        request.get(config.api.base + config.api.comment,{
            creation:123,
            accessToken:'xiaohai',
            page:page
        })
            .then((data) => {
                if (data.success){

                    var items = cacheResults.items.slice();
                        items = items.concat(data.data);
                        cacheResults.nextPage += 1;



                    cacheResults.items = items;

                    cacheResults.total = data.total;
                    console.log(data.total);

                            that.setState({
                                isLoadingTail: false,
                                dataSource: that.state.dataSource.cloneWithRows(cacheResults.items)
                            })

                }
            })
            .catch((error) => {

                    this.setState({
                        isLoadingTail: false
                    });

                console.warn(error);
            });
    },

    _hasMore(){
        //用来判断是否还有数据存在
        return cacheResults.items.length !== cacheResults.total
    },

    _fetchMoreData(){
        if (!this._hasMore() || this.state.isLoadingTail){
            return
        }

        var page = cacheResults.nextPage;
        this._fetchData(page);

    },


    _renderFooter(){
        if (!this._hasMore() && cacheResults.total !== 0){
            return (
                <View style={styles.loadingMore}>
                    <Text style={styles.loadingText}>没有更多数据了!</Text>
                </View>
            )
        }

        if (!this.state.isLoadingTail){
            return <View style={styles.loadingMore}>

                    </View>
        }

        return <ActivityIndicatorIOS style={styles.loadingMore} />

    },

    _renderRow(row){

        return (

        <View key={row._id} style={styles.replyBox}>
            <Image style={styles.replyAvatar} source={{uri:row.replyBy.avatar}}/>
            <View style={styles.reply}>
                <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
                <Text style={styles.replyContent}>{row.content}</Text>
            </View>

        </View>
        )
    },
    _focus(){
        this._setModalVisible(true);
    },
    _blur(){

    },
    _closeModal(){
        this._setModalVisible(false);
    },
    _setModalVisible(isVisible){
      this.setState({
          modalVisible: isVisible
      })
    },
    _renderHeader(){
        var data = this.state.data;
        return (
            <View style={styles.listHeader}>
                <View style={styles.infoBox}>
                    <Image style={styles.avatar} source={{uri:data.author.avatar}}></Image>
                    <View style={styles.descBox}>
                        <Text style={styles.nickname}>{data.author.nickname}</Text>
                        <Text style={styles.title}>{data.title}</Text>
                    </View>
                </View>
                <View style={styles.commentBox}>
                    <View style={styles.comment}>

                        <TextInput placeholder='好喜欢这个动漫...'
                            style={styles.content}
                           multiline={true}
                           onFocus={this._focus}
                        />
                    </View>
                </View>

                <View style={styles.commentArea}>
                    <Text style={styles.commentTitle}>精彩评论</Text>
                </View>
            </View>
        )
    },

    _submit(){
        var that = this;
        if (!this.state.content){
            return AlertIOS.alert('留言不能为空');
        }
        if (this.state.isSending){
            return AlertIOS.alert('正在评论中');
        }
        this.setState({
            isSending:true
        },function(){
            var body={
                accessToken:'xiaohai',
                creation:'123',
                content:this.state.content
            };

            var url = config.api.base + config.api.comment;

            request.post(url,body)
                .then(function(data){
                    if (data && data.success){
                        var items = cacheResults.items.slice();
                        var content= that.state.content;
                        items = [{

                            content:content,
                            replyBy:{
                                nickname:'小海说',
                                avatar:'http://dummyimage.com/640x640/b5eb54)'
                            }
                        }].concat(items);

                        cacheResults.items = items;
                        cacheResults.total = cacheResults.total + 1;
                        that.setState({
                            content:'',
                            isSending:false,
                            dataSource:that.state.dataSource.cloneWithRows(cacheResults.items)
                        });

                        that._setModalVisible(false);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    that.setState({
                        isSending:false,
                    });
                    that._setModalVisible(false);
                    AlertIOS.alert('留言失败,请重试')
                })
        })
    },

    render: function(){
        var data = this.props.data; //获取到父级传递来的数据
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBox} onPress={this._pop}>
                        <Icon name='ios-arrow-back' style={styles.backIcon}/>
                        <Text style={styles.backText}>返回</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>视频详情页</Text>
                </View>
                <Text>详情页面{data._id}</Text>
                <View style={styles.videoBox}>
                    <Video
                        ref="videoPlayer" //播放名称
                        source={{uri:data.video }} //播放的数据
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

                    {/*<View style={styles.videoSlider}>*/}
                        {/*<SliderIOS*/}
                                    {/*value={this.state.value}*/}
                                    {/*onSlidingComplete={this._slider}*/}
                                    {/*onValueChange={(value)=>this.setState({value:value})}*/}
                        {/*/>*/}
                    {/*</View>*/}




                </View>
                    {/*出错时*/}
                    {
                        !this.state.videoOk && <Text style={styles.failText}>视频出错了!很抱歉</Text>
                    }
                    {/*显示转圈*/}
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
                                    : <Text>

                                      </Text>
                                }
                            </TouchableOpacity>
                        :
                            null
                    }



                    {/*这个才是进度条的组件*/}
                    <View style={styles.progressBox}>
                        <View style={[styles.progressBar,{width:width * this.state.videoProgress}]}>

                        </View>
                    </View>






                    <ListView
                        dataSource={this.state.dataSource}  //获取数据
                        renderRow={this._renderRow} //讲获取的数据填充到视图中

                        showsVerticalScrollIndicator = {true} //是否显示进度条
                        enableEmptySections = {true} //不需要空白的位置
                        automaticallyAdjustContentInsets={false} //自动调整内容


                        onEndReached={this._fetchMoreData}   //当所有的数据都已经渲染过，
                                                           // 并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                        renderHeader={this._renderHeader}
                        renderFooter={this._renderFooter}   //到达底部时渲染 下拉事件

                    />

                    <Modal
                        animationType={'fade'} //浮层出现的形式
                        visible={this.state.modalVisible} //是否可见
                        onRequestClose={()=> {this._setModalVisible(false)}} //关闭时调用
                    >
                        <View style={styles.modalContainer}>
                            <Icon onPress={this._closeModal}
                                  name="ios-close-outline"
                                  style={styles.closeIcon}
                            />
                            <View style={styles.commentBox}>
                                <View style={styles.comment}>

                                    <TextInput placeholder='好喜欢这个动漫啊...'
                                               style={styles.content}
                                               multiline={true}
                                               defaultValue={this.state.content}
                                               onChangeText={(text)=>{
                                                   this.setState({
                                                       content:text
                                                   })
                                               }}
                                    />
                                </View>
                            </View>
                            <Text style={styles.submitBtn} onPress={this._submit}>评论
                            </Text>
                        </View>



                    </Modal>




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
    videoSlider:{
        flex:1,
        marginTop:-10,
        width:width,
        height:20
    },
    modalContainer:{
        flex:1,
        paddingTop:45,
        backgroundColor:'#fff'

    },
    closeIcon:{
        alignSelf:'center',
        fontSize:30,
        color:'#ee753c'
    },
    submitBtn:{
      width:width - 20,
        padding:16,
        marginTop:20,
        marginBottom:20,
        marginLeft:10,
        borderWidth:1,
        borderColor:'#ee753c',
        borderRadius:4,
        fontSize:18,
        color:'#ee753c',
        textAlign:'center'
    },
    header:{
      flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:width,
        height:64,
        paddingTop:20,
        paddingLeft:10,
        paddingRight:10,
        borderBottomWidth:1,
        borderColor:'rgba(0,0,0,1)',
        backgroundColor:'#fff'
    },
    backBox:{
        position:'absolute',
        left:12,
        top:32,
        width:50,
        flexDirection:'row',
        alignItems:'center'
    },
    headerTitle:{
      width:width-120,
        textAlign:'center'
    },
    backIcon:{
      color:'#999',
        fontSize:20,
        marginRight:5
    },
    backText:{
        color:'#999'
    },
    videoBox:{
        width:width,
        height:width * 0.56,
        backgroundColor:'#000'
    },
    video:{
        width:width,
        height:width * 0.56,
        backgroundColor:'#000'
    },
    failText:{
        position:'absolute',
        left: 0,
        top:width*0.56 -60,
        width:width,
        textAlign:'center',
        color:'#fff',
        backgroundColor:'transparent'
    },
    loading:{
        position:'absolute',
        left: 0,
        top:width*0.56 - 40,
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
        top:90,
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
        height:width * 0.56,
        position:'absolute',
        left:0,
        top:80
    },
    resumeIcon:{
        position:'absolute',
        top:80,
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

    infoBox:{
        width:width,
        flexDirection:'row',
        justifyContent:'center',
        marginTop:10
    },
    avatar:{
        width:60,
        height:60,
        marginRight:10,
        marginLeft:10,
        borderRadius:30,
    },
    descBox:{
        flex:1
    },
    nickname:{
        fontSize:18
    },
    title:{
        marginTop:9,
        fontSize:16,
        color:'#666'
    },
    replyBox:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginTop:10
    },
    replyAvatar:{
        width:40,
        height:40,
        marginRight:10,
        marginLeft:10,
        borderRadius:20
    },
    replyNickname:{
        color:'#666'
    },
    replyContent:{
        marginTop:4,
        color:'#666'
    },
    reply:{
        flex:1
    },
    loadingMore:{
        marginVertical:20,
    },
    loadingText:{
        color: '#777',
        marginLeft:width/2 - 50

    },
    listHeader:{
        width:width,
        marginTop:10
    },
    commentBox:{
      marginTop:10,
        padding:8,
        width:width
    },
    content:{
        paddingLeft:2,
        color:'#333',
        borderWidth:1,
        borderColor:'#ddd',
        borderRadius:4,
        fontSize:14,
        height:80
    },
    commentArea:{
        width:width,
        marginTop:10,
        paddingBottom:6,
        paddingLeft:10,
        paddingRight:10,
        borderBottomWidth:1,
        borderBottomColor:'#eee'
    },


});

module.exports = Detail;