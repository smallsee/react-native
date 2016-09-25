/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var request = require('../common/request')
var config = require('../common/config')

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
        var that =this;
        var up = !this.state.up;
        var row = this.state.row;
        var url = config.api.base + config.api.up;

        var body = {
            id: row._id,
            up: up ? 'yes' : 'no',
            accessToken: 'xiaohai'
        }


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
            isLoadingTail:false,
            isRefreshing:false,
            dataSource: ds.cloneWithRows([]),
        };
    },

    _renderRow(row) {
        return <Item
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

    // _loadPage(){
    //   this.props.navigator.push({
    //       name:'detail',
    //       component:Detail
    //   })
    // },

    render(){
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>列表页面</Text>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}

                    renderFooter={this._renderFooter}
                    onEndReached={this._fetchMoreData}
                    showsVerticalScrollIndicator = {false}
                    onEndReachedThreshold={20}
                    enableEmptySections = {true}
                    automaticallyAdjustContentInsets={false}

                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh}
                            tintColor="#ff6600"
                            title="拼命加载中..."
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