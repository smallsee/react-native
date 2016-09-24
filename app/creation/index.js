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
        request.get(config.api.base + config.api.creations,{
           accessToken: 'ssxc',
            page:page
        })
            .then((data) => {
                if (data.success){
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(data.data)
                    })
                }
                console.log(data);
            })
            .catch((error) => {
                console.warn(error);
            });
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
                enableEmptySections = {true}
                automaticallyAdjustContentInsets={false}
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
    }
});

module.exports = List;