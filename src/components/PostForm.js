import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

class PostForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            username: "",
            password: "",
            option: "",
            token: "",
            search: "",
            count: 20,
            page: 0,
            searchType: "",
            mahasiswa: []
        }
    }

    /* 
    serialize function: Converts {obj} into url-encoded form
    */
    serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    optionRegister = e => {
        this.setState({option: "register"})
    }

    optionLogin = e => {
        this.setState({option: "login"})
    }

    assignToken = function(tokenTemp) {
        this.setState({token: tokenTemp})
    }

    assignMahasiswa = function(data) {
        this.setState({mahasiswa: data})
    }

    searchTypeName = e => {
        this.setState({searchType: "byname"})
        this.setState({page: 0})        // reset page
    }

    searchTypeId = e => {
        this.setState({searchType: "byid"})
        this.setState({page: 0 })       // reset page
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleNext = e => {
        this.setState({page: (this.state.page + 1)})
    }

    handlePrev = e => {
        this.setState({page: (this.state.page - 1)})
    }

    handleSearch = e => {
        e.preventDefault()

        var data

        if (this.state.searchType === "byid") { // a number from 0 to 9
            data = {
                "query": this.state.search,
                "count": this.state.count,
                "page": this.state.page
            }
        }
        else {    // a Name
            data = {
                "name": this.state.search,
                "count": this.state.count,
                "page": this.state.page
            }
        }

        var getRequest = {
            method: 'GET',
            url: 'https://api.stya.net/nim/' + this.state.searchType + "?" + this.serialize(data),
            headers: {
                'Auth-Token': this.state.token
            }
        }

        axios(getRequest)
            .then(response => {
                console.log(response.data)
                var statusSearch = response.data.status

                // output data (handleOutput)
                if (response.data.code >= 0) {
                    this.assignMahasiswa(response.data.payload)
                }
                else {
                    ReactDOM.render(<div>{statusSearch}</div>, document.getElementById('statusSearch'))
                    document.getElementById("next").disabled = true
                    this.assignMahasiswa([])
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    handleRegisterLogin = e => {
        e.preventDefault()

        var data = {
            "username" : this.state.username,
            "password" : this.state.password
        }

        // Post request using axios
        var postRequest = {
            method: 'POST',
            url: 'https://api.stya.net/nim/' + this.state.option,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: this.serialize(data)
        };


        axios(postRequest)
            .then(response => {
                console.log(response.data)
                var statusLogin = response.data.status
                if (response.data.code === 0) {
                    ReactDOM.render(<div>Login Successful</div>, document.getElementById('statusLogin'))
                    ReactDOM.render(<div></div>, document.getElementById('statusSearch'))
                    ReactDOM.render(<div>Welcome, {this.state.username}</div>, document.getElementById('user'))
                    this.assignToken(response.data.token)
                }
                else {
                    ReactDOM.render(<div>{statusLogin}</div>, document.getElementById('statusLogin'))
                    ReactDOM.render(<div></div>, document.getElementById('user'))
                    this.assignToken("")
                }
                
            })
            .catch(error => {
                console.log(error)
            })
    }

    render() {
        const { username, password, search, mahasiswa } = this.state
        return (
            <div>
                <form onSubmit={this.handleRegisterLogin}>
                    <div>
                        <input placeholder="Username" ref="username" type="text" name="username" value={username} onChange={this.handleChange}></input>
                    </div>
                    <div>
                        <input placeholder="Password" ref="password" type="text" name="password" value={password} onChange={this.handleChange}></input>
                    </div>
                    <button type="submit" onClick={this.optionRegister}>Register</button>
                    <button type="submit" onClick={this.optionLogin}>Login</button>
                    <div id="statusLogin"></div>
                </form>

                <br></br>

                <form onSubmit={this.handleSearch}>
                    <div id="user"></div>
                    <div>
                        <input placeholder="Type in Name or NIM" ref="search" type="text" name="search" value={search} onChange={this.handleChange}></input>
                    </div>
                    <button type="submit" onClick={this.searchTypeName}>Search by Name</button>
                    <button type="submit" onClick={this.searchTypeId}>Search by NIM</button>
                    <div id="statusSearch"></div>
                    <div>
                        Search results :
                        <br></br>
                        Nama | NIM TPB | NIM Jurusan | Prodi
                        {
                            mahasiswa.length ?
                            mahasiswa.map(mhs => (<li key={mhs.nim_tpb}>{mhs.name} | {mhs.nim_tpb} | {mhs.nim_jur} | {mhs.prodi}</li>)) :
                            null
                        }
                    </div>
                    <button id="prev" type="submit" disabled={false} onClick={this.handlePrev}>Prev</button>
                    <button id="next" type="submit" disabled={false} onClick={this.handleNext}>Next</button>
                </form>
            </div>
        )
    }
}

/*

*/
export default PostForm