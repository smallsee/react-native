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

var width = Dimensions.get('window').width;

var cacheResults = {
    nextPage: 1,
    items:[],
    total: 0
};

//列表页面
var List = React.createClass({

    getInitialState: function() {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            isLoadingTail:false,
            isRefreshing:false,
            dataSource: ds.cloneWithRows([]),
        };
    },

    _renderRow(row) {
        return (
            <TouchableHighlight>
                <View style={styles.item}>
                    <Text style={styles.title}>{row.title}</Text>
                    <Image source={{uri: row.thumb}}
                           style={styles.thumb}>
                        <Icon name="ios-play" size={28} style={styles.play} />
                    </Image>
                    <View style={styles.itemFooter}>
                        <View style={styles.handleBox}>
                            <Icon name="ios-heart-outline" size={28} style={styles.up} />
                            <Text style={styles.handleText}>喜欢</Text>
                        </View>

                        <View style={styles.handleBox}>
                            <Icon name="ios-chatboxes-outline" size={28} style={styles.commentIcon} />
                            <Text style={styles.handleText}>评论</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    },

    componentDidMount() {
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
            accessToken: 'ssxc',
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

    }
});

module.exports = List;