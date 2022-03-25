# Overview 
Issur Melacha is a simple filter which will output an incoming msg to one of two different outputs depending if an Issur Melacha (on Jewish Holidays and Shabbet) is in effect.
## Options
### Lat (required)
The Latitude to calculate the Zmanim.
### Lon (required)
The Longitude to calculate the Zmanim.
### Diaspora
Whether to apply Zmanim for the Diaspora (2 days on Holidays).
### Start Offset
You can add a custom offset (in minutes) calculated on Sunset when the Zman for Issur Melacha starts (can be either positive or negative), the default is at Sunset.
### End Offset
You can add a custom offset (in minutes) calculated on Sunset when the Zman for Issur Melacha ends (can be either positive or negative), the default is 72 min after Sunset.
### Repeat msg
While an Issur Melacha is in effect the msg can be repated by a preset interval.