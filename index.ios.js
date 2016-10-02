/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var AppRegistry = React.AppRegistry;
var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var TabBarIOS = React.TabBarIOS;
var Navigator = React.Navigator;
var AsyncStorage  = React.AsyncStorage;



//列表页面
var List = require('./app/creation/index');
var Edit = require('./app/edit/index');
var Accout = require('./app/account/index');
var Login = require('./app/account/login');




var xiaohai = React.createClass({
  getInitialState: function() {
    return {
      selectedTab: 'account',
        logined:false,
        user : null,
    };
  },

    componentDidMount(){
      this._asyncAppStatus()
    },

    _asyncAppStatus(){
        var that = this;
        AsyncStorage.getItem('user')
            .then((data)=>{
                var user;
                var newState = {}

                if (data){
                    user = JSON.parse(data);
                }

                if (user && user.accessToken){
                    newState.user = user;
                    newState.logined = true;
                }else{
                    newState.logined = false;
                }

                that.setState(newState);
            })
    },
    _afterLogin(user){
        var that = this;
        user = JSON.stringify(user);
        AsyncStorage.setItem('user',user)
            .then((data) => {
                that.setState({
                    logined:true,
                    user:user
                })
            })
    },

render() {

        if(!this.state.logined){
            return <Login afterLogin={this._afterLogin}  />
        }
  return (
      <TabBarIOS
          tintColor="#ee735c"
          >
        <Icon.TabBarItem
            renderAsOriginal = {true}
            iconName='ios-videocam-outline'  //没有选择时的图标
            selectedIconName='ios-videocam'     //选择后的图标
            selected={this.state.selectedTab === 'list'}
            onPress={() => {
              this.setState({
                selectedTab: 'list',
              });
            }}>
            <Navigator
                initialRoute={{
                    name:'list', //主要路由名称
                    component:List //模板 也就是列表页所导出的模板,name是用来后面调用的时候用的
                }}
                configureScene={(route)=>{
                    //切换页面的时候的样式
                    return Navigator.SceneConfigs.FloatFromRight
                }}
                renderScene={(route,navigator)=>{
                    var Component = route.component
                    //切换页面的时候想传递的参数
                    return <Component {...route.params} navigator={navigator}/>
                }}
            />
        </Icon.TabBarItem>
          <Icon.TabBarItem
              renderAsOriginal = {true}
              iconName='ios-recording-outline'
              selectedIconName='ios-recording'
              selected={this.state.selectedTab === 'edit'}
              onPress={() => {
                  this.setState({
                      selectedTab: 'edit',
                  });
              }}>
              <Edit />
          </Icon.TabBarItem>
          <Icon.TabBarItem
              renderAsOriginal = {true}
              iconName='ios-more-outline'
              selectedIconName='ios-more'
              selected={this.state.selectedTab === 'account'}
              onPress={() => {
                  this.setState({
                      selectedTab: 'account',
                  });
              }}>
              <Accout />
          </Icon.TabBarItem>


      </TabBarIOS>
  );
},

});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

AppRegistry.registerComponent('xiaohai', () => xiaohai);
