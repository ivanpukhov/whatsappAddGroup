import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Paper, TextField, Button, Chip, LinearProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  app: {
    display: 'flex',
    height: '100vh',
  },
  groupsList: {
    width: '30%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: '#ededed',
  },
  chatSection: {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  inputField: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  progress: {
    width: '100%',
    marginTop: '10px',
  }
}));

const idInstance = ''; // Замените на ваш IdInstance
const apiTokenInstance = ''; // Замените на ваш ApiTokenInstance

function App() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`https://api.green-api.com/waInstance${idInstance}/getContacts/${apiTokenInstance}`);
        const groupsData = response.data.filter(contact => contact.type === 'group');
        setGroups(groupsData);
      } catch (error) {
        console.error('Ошибка при загрузке групп:', error);
      }
    };

    fetchGroups();
  }, []);

  return (
      <div className={classes.app}>
        <Paper className={classes.groupsList}>
          <List>
            {groups.map(group => (
                <ListItem button key={group.id} onClick={() => setSelectedGroupId(group.id)}>
                  <ListItemText primary={`${group.name} - ${group.id}`} />
                </ListItem>
            ))}
          </List>
        </Paper>
        {selectedGroupId && (
            <div className={classes.chatSection}>
              <AddParticipants groupId={selectedGroupId} />
            </div>
        )}
      </div>
  );
}

function AddParticipants({ groupId }) {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentNumber, setCurrentNumber] = useState('');
  const [progress, setProgress] = useState(0);

  const handleInputChange = (event) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue);

    // Разделяем строку ввода на номера, фильтруем пустые строки
    const newNumbers = newInputValue.split(' ').filter(num => num !== '');
    setPhoneNumbers(newNumbers);
  };

  const handleDelete = (phoneNumberToDelete) => () => {
    setPhoneNumbers((numbers) => numbers.filter((number) => number !== phoneNumberToDelete));
    // Обновляем строку ввода после удаления тега
    setInputValue(phoneNumbers.join(' '));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue) {
      // Разделяем введенный текст на номера, разделенные пробелами
      const newNumbers = inputValue.split(' ').filter(num => num !== '');
      setPhoneNumbers([...phoneNumbers, ...newNumbers]);
      setInputValue('');
    }
  };

  const handleAddParticipants = async () => {
    setLoading(true);
    setProgress(0);

    for (let i = 0; i < phoneNumbers.length; i++) {
      const number = phoneNumbers[i];
      setCurrentNumber(number);
      const participantChatId = `${number}@c.us`;

      try {
        await axios.post(`https://api.green-api.com/waInstance${idInstance}/addGroupParticipant/${apiTokenInstance}`, {
          groupId,
          participantChatId
        });
        setProgress(((i + 1) / phoneNumbers.length) * 100);
      } catch (error) {
        console.error(`Ошибка при добавлении участника: ${error}`);
      }
    }

    setLoading(false);
    setPhoneNumbers([]);
    setCurrentNumber('');
  };

  return (
      <div>
        <Paper component="ul" className={classes.chipContainer}>
          {phoneNumbers.map((data, index) => (
              <li key={index}>
                <Chip
                    label={data}
                    onDelete={handleDelete(data)}
                    className={classes.chip}
                />
              </li>
          ))}
        </Paper>
        <TextField
            label="Введите номера телефонов"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={classes.inputField}
            fullWidth
            variant="outlined"
        />
        <Button
            variant="contained"
            color="primary"
            onClick={handleAddParticipants}
            disabled={loading}
        >
          Добавить участников
        </Button>
        {loading && (
            <div className={classes.progress}>
              <LinearProgress variant="determinate" value={progress} />
              <p>Добавление {currentNumber} ({Math.round(progress)}%)</p>
            </div>
        )}
      </div>
  );
}

export default App;
