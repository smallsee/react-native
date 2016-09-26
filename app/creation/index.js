/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var request = require('../common/request');
var config = require('../common/config');
var Detail = require('./detail');

var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var TouchableHighlight = React.TouchableHighlight;
var Image = React.Image;
var ListView = React.ListView;
var Dimensions = React.Dimensions;
var ActivityIndicatorIOS = React.ActivityIndicatorIOS;
var RefreshControl = React.RefreshControl;
var AlertIOS = React.AlertIOS;

var width = Dimensions.get('window').width;

var cacheResults = {
    nextPage: 1,
    items:[],
    total: 0
};


//子组件
var Item = React.createClass({

    getInitialState(){
        var row = this.props.row;
        return {
            up:row.voted,
            row:row
        }
    },
    _up(){
        var that = this; //因为我们用延迟两秒来还原真实数据的到来,所以若果直接设置this会报错
        var up = !this.state.up; //双击的话就取反
        var row = this.state.row; //获取到数据
        var url = config.api.base + config.api.up ;  //post传递的地址

        var body = {
            id: row._id, //第几条数据
            up: up ? 'yes' : 'no', //显示还是不显示
            accessToken: 'xiaohai' //请求地址的标识
        };
        request.post(url,body)
            .then(function(data){
                console.log(url);
                if (data && data.success){
                    that.setState({
                        up:up
                    })
                }else{
                    AlertIOS.alert('点赞失败,稍后重试')
                }
            })
            .catch(function(err){
                console.log(err)
                AlertIOS.alert('点赞失败,稍后重试')
            })

    },
   render (){
        var row = this.state.row;
       return (
           <TouchableHighlight onPress={this.props.onSelect}>
               <View style={styles.item}>
                   <Text style={styles.title}>{row.title}</Text>
                   <Image source={{uri: row.thumb}}
                          style={styles.thumb}>
                       <Icon name="ios-play" size={28} style={styles.play} />
                   </Image>
                   <View style={styles.itemFooter}>
                       <View style={styles.handleBox}>
                           <Icon name={this.state.up ? "ios-heart" :"ios-heart-outline"} size={28}
                                 style={[styles.up,this.state.up ? null : styles.down]}
                                 onPress={this._up}/>
                           <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
                       </View>

                       <View style={styles.handleBox}>
                           <Icon name="ios-chatboxes-outline" size={28} style={styles.commentIcon} />
                           <Text style={styles.handleText}>评论</Text>
                       </View>
                   </View>
               </View>
           </TouchableHighlight>
       )
   }
});

//列表页面
var List = React.createClass({

    //根据生命周期会第一个调用这个方法
    getInitialState: function() {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            isLoadingTail:false,  //是否下拉
            isRefreshing:false, //是否上划
            dataSource: ds.cloneWithRows([]),
        };
    },

    _renderRow(row) {
        return <Item
            key={row._id}
            onSelect={()=>this._loadPage(row)} //当数据图被选中 也就是点击的时候却换页面调用的而方法
            row={row} />
    },


    //获取外部数据的传递
    componentDidMount() {  //页面加载好后
        this._fetchData(1)
    },


    _fetchData(page) {
        var that = this;

        if (page !== 0){
            this.setState({
                isLoadingTail: true
            });
        }else{
            this.setState({
                isRefreshing: true
            });
        }
        request.get(config.api.base + config.api.creations,{
            accessToken: 'xiaohai',
            page:page
        })
            .then((data) => {
                if (data.success){

                    var items = cacheResults.items.slice();

                    if (page !== 0){
                        items = items.concat(data.data);
                        cacheResults.nextPage += 1;
                    }else{
                        items = data.data.concat(items);
                    }


                    cacheResults.items = items;

                    cacheResults.total = data.total;
                    console.log(data.total);
                    setTimeout(function(){
                        if (page !== 0){
                            that.setState({
                                isLoadingTail: false,
                                dataSource: that.state.dataSource.cloneWithRows(cacheResults.items)
                            })
                        }else{
                            that.setState({
                                isRefreshing: false,
                                dataSource: that.state.dataSource.cloneWithRows(cacheResults.items)
                            })
                        }

                    },2000);
                }
            })
            .catch((error) => {
                if (page !== 0){
                    this.setState({
                        isLoadingTail: false
                    });
                }else{
                    this.setState({
                        isRefreshing: false
                    });
                }
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

    _onRefresh(){
        if (!this._hasMore() || this.state.isRefreshing){
            return
        }
        this._fetchData(0);
    },

    _renderFooter(){
        if (!this._hasMore() && cacheResults.total !== 0){
            return (
                <View style={styles.loadingMore}>
                    <Text style={styles.loadingText}>没有更多了</Text>
                </View>
            )
        }

        if (!this.state.isLoadingTail){
            return <View style={styles.loadingMore}></View>
        }

        return <ActivityIndicatorIOS style={styles.loadingMore} />

    },

    _loadPage(row){
      this.props.navigator.push({
          name:'detail',
          component:Detail,  //模板
          params:{
              data:row //获取到这个页面的数据 也就是视频的数据 给下个详情页去添加
          }
      })
    },

    render(){
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>列表页面</Text>
                </View>
                <ListView

                    dataSource={this.state.dataSource}  //获取数据
                    renderRow={this._renderRow} //讲获取的数据填充到视图中



                    onEndReachedThreshold={20}            //调用onEndReached之前的临界值，单位是像素。



                    showsVerticalScrollIndicator = {false} //是否显示进度条

                    enableEmptySections = {true} //不需要空白的位置
                    automaticallyAdjustContentInsets={false}

                    onEndReached={this._fetchMoreData}   //当所有的数据都已经渲染过，
                    // 并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                    renderFooter={this._renderFooter}   //到达底部时渲染 下拉事件

                    refreshControl={  //上划事件
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh}
                            tintColor="#ff6600"
                            title="拼命加载中1..."
                        />
                    }
                />
            </View>
        )
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    header:{
        padding:25,
        paddingBottom:12,
        backgroundColor:'#ee735c'
    },
    headerTitle:{
        color:'#fff',
        fontSize:16,
        fontWeight: '600',
        textAlign:'center'

    },
    item:{
        width: width,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    thumb:{
        width:width,
        height:width * 0.56,
        resizeMode: 'cover'
    },
    title:{
        padding:10,
        fontSize:18,
        color:'#333'
    },
    itemFooter:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#eee'
    },
    handleBox:{
        padding:10,
        flexDirection:'row',
        width: width/2 -0.5,
        justifyContent:'center',
        backgroundColor:'#fff'
    },
    play:{
        position:'absolute',
        bottom:14,
        right:14,
        height:46,
        width:46,
        paddingTop:9,
        paddingLeft:18,
        backgroundColor:'transparent',
        borderColor:'#fff',
        borderWidth:1,
        borderRadius: 23,
        color:'#ed7b66'
    },
    handleText:{
        paddingLeft:12,
        fontSize:18,
        color:'#333'
    },
    up:{
        fontSize:22,
        color:'#ed7b66'
    },
    down:{
        fontSize:22,
        color:'#333'
    },
    commentIcon:{
        fontSize:22,
        color:'#333'
    },
    loadingMore:{
        marginVertical:20
    },
    loadingText:{
        color: '#777',
        textAlign:'center'

    },

});

module.exports = List;