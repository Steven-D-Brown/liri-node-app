# liri-node-app

Run the app with Node. It will prompt you to choose one of four functionalities. Choose whichever you want. The do-what-it-says option will read the random.txt file and take input from there. It is not able to execute the do-what-it-says function itself from the file, so you don't need to worry about breaking the app.

After choosing any of the first three options, the app will prompt you for more information, which it will use to find the information you want. After recieving the information, the app will report the relevant information to you.

In the event that you choose do-what-it-says, it will read information from the random.txt file. If there is no extra input in the file telling the app what to search for, it will prompt you to provide the information yourself. If the input for the function in the random.txt file has a first character that is either a single or a double quotation mark (' or "), the app will remove the first and last characters to try to remove the quotes. There should be no more than one comma in random.txt. The app reads either the whole string as a command or, if there is a comma, divides the content up after commas. It will read any content before the first comma as a command and any content up to the end or the second comma (if there is one) as the desired input.

If you do not provide extra information when prompted, the functionality depends on the function. The spotify-this-song function will give information for "The Sign" by Ace of Base. The concert-this function will tell you it cannot find any concerts without input. The movie-this function will search for information for the movie "Mr. Nobody."

Otherwise, the functions return information will provide results based on the input you (or the random.txt file) provided. The concert-this and spotify-this-song functions will give a list of responses. The movie-this function will only give information for one movie.

Check the Video or Snapshots folder for more information.