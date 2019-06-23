import React, {Component} from 'react'
import { Card, Accordion, Icon } from 'semantic-ui-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMusic } from '@fortawesome/free-solid-svg-icons'

class PlaylistInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeIndex: '',
        }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const {activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex })
    }

    render() {
        const { playlists } = this.props
        
        if(playlists.length > 0) {
            return (
                <Card fluid>
                <Card.Content>
                    <Card.Header>
                        <FontAwesomeIcon icon={faMusic} /> Playlists
                    </Card.Header>
                </Card.Content>
                <Card.Content>
                    <Accordion fluid styled>
                        {playlists.map((songs, songsIndex) => (
                            <div key={songs[0].playlist_name + 'List'}>
                            <Accordion.Title active={this.state.activeIndex === songsIndex} index={songsIndex} onClick={this.handleClick}>
                            <Icon name='dropdown' />
                            {songs[0].playlist_name} ({songs.length} songs)
                        </Accordion.Title>
                        <Accordion.Content active={this.state.activeIndex === songsIndex}>
                            <ul>
                                {songs.map((song, songIndex) => (
                                    <li key={songs[0].playlist_name + songIndex}>{song.song_name} - {song.artist_name}</li>
                                ))}
                            </ul>
                        </Accordion.Content>
                        </div>
                        ))}
                    </Accordion>
                </Card.Content>
                </Card>
            )
        }
        return (
            <Card fluid>
            <Card.Content>
                <Card.Header>
                        <FontAwesomeIcon icon={faMusic} /> Playlists
                </Card.Header>
            </Card.Content>
            <Card.Content />
            </Card>
    )
    }
}

export default PlaylistInfo