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
            searchTemp: "",
            count: 20,
            page: 0,
            searchType: "",
            mahasiswa: [],
            prev: true,
            next: true
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
        this.setState({searchTemp: this.state.search})
    }

    searchTypeId = e => {
        this.setState({searchType: "byid"})
        this.setState({page: 0 })       // reset page
        this.setState({ searchTemp: this.state.search })
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

        if (this.state.page > 0) {
            this.setState({prev: false})
        }
        else {
            this.setState({prev: true})
        }

        var data

        if (this.state.searchType === "byid") { // a number from 0 to 9
            data = {
                "query": this.state.searchTemp,
                "count": this.state.count,
                "page": this.state.page
            }
        }
        else {    // a Name
            data = {
                "name": this.state.searchTemp,
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
                    data = {
                        "name": this.state.searchTemp,
                        "count": this.state.count,
                        "page": this.state.page + 1
                    }
                    getRequest = {
                        method: 'GET',
                        url: 'https://api.stya.net/nim/' + this.state.searchType + "?" + this.serialize(data),
                        headers: {
                            'Auth-Token': this.state.token
                        }
                    }
                    axios(getRequest)
                        .then(response => {
                            if (response.data.code === 0) {
                                this.setState({next: true})
                            }
                            else if (response.data.code > 0) {
                                this.setState({next: false})
                            }
                        })
                        .catch(error => {
                            console.lof(error)
                        })
                }
                else {
                    ReactDOM.render(<div>{statusSearch}</div>, document.getElementById('statusSearch'))
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
        const { username, password, search, mahasiswa, prev, next } = this.state
        return (
            <div>
                <h1>
                    A Simple ITB NIM Finder
                </h1>
                <form onSubmit={this.handleRegisterLogin}>
                    <div>
                        <input placeholder="Username" ref="username" type="text" name="username" value={username} onChange={this.handleChange}></input>
                    </div>
                    <div>
                        <input placeholder="Password" ref="password" type="text" name="password" value={password} onChange={this.handleChange}></input>
                    </div>
                    <button className="button1" type="submit" onClick={this.optionRegister}><span>Register</span></button>
                    <button className="button1" type="submit" onClick={this.optionLogin}><span>Login</span></button>
                    <h3 id="statusLogin"> </h3>
                </form>

                <br></br>

                <form onSubmit={this.handleSearch}>
                    <h3 id="user"> </h3>
                    <div>
                        <input placeholder="Type in Name or NIM..." ref="search" type="text" name="search" value={search} onChange={this.handleChange}></input>
                        <button className="button2" type="submit" onClick={this.searchTypeName}><span>Search by Name</span></button>
                        <button className="button2" type="submit" onClick={this.searchTypeId}><span>Search by NIM</span></button>
                    </div>
                    <h3 id="statusSearch"> </h3>
                    <br></br>
                    <table>
                        <tbody>
                            <tr>
                                <th>Nama</th>
                                <th>NIM TPB</th>
                                <th>NIM Jurusan</th>
                                <th>Prodi</th>
                            </tr>
                            {
                                mahasiswa.length ?
                                    mahasiswa.map(mhs => (<tr key={mhs.nim_tpb}>
                                        <td>{mhs.name}</td>
                                        <td>{mhs.nim_tpb}</td>
                                        <td>{mhs.nim_jur}</td>
                                        <td>{mhs.prodi}</td>
                                    </tr>)) :
                                    null
                            }
                        </tbody>
                    </table>
                    
                    <p align="center">
                        <button className="button3" type="submit" disabled={prev} onClick={this.handlePrev}><span>Prev</span></button>
                        <button className="button4" type="submit" disabled={next} onClick={this.handleNext}><span>Next</span></button>
                    </p>
                </form>
            </div>
        )
    }
}

/*
<div>
    Search results :
    <br></br>
    Nama | NIM TPB | NIM Jurusan | Prodi
    <br></br>
    ------------------------------------------------------------------
    {
        mahasiswa.length ?
        mahasiswa.map(mhs => (<li key={mhs.nim_tpb}>{mhs.name} | {mhs.nim_tpb} | {mhs.nim_jur} | {mhs.prodi}</li>)) :
        null
    }
</div>
*/
export default PostForm