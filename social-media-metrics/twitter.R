## Load libraries
library(lubridate)
library(tidyverse)

## Read in data
data1 <- read.csv("twit_data/tweet_activity_metrics_hoprnet_20201201_20210101_en.csv")
data2 <- read.csv("twit_data/tweet_activity_metrics_hoprnet_20210101_20210201_en.csv")
data3 <- read.csv("twit_data/tweet_activity_metrics_hoprnet_20210201_20210301_en.csv")
data4 <- read.csv("twit_data/tweet_activity_metrics_hoprnet_20210301_20210401_en.csv")
data5 <- read.csv("twit_data/tweet_activity_metrics_hoprnet_20210401_20210414_en.csv")
data <- do.call(rbind,list(data1,data2,data3,data4,data5))
data$Time <- as_datetime(data$time,format="%Y-%m-%d %H:%M")
data <- data[order(data$Time),]
data$Date <- as_datetime(format(data$Time,"%Y-%m-%d"))
data$Weekday <- format(data$Date,"%w")

## Events DF
events <- data.frame(
                        start = as_datetime(c("2021-01-18","2021-02-24")),
                        end = as_datetime(c("2021-01-21","2021-03-02")),
                        name = c("Titlis Testnet","Jungfrau Launch")
                    )

## Data Events Excluded
data_ev_ex <- data[!(data$Date >= events$start[1] & data$Date <= events$end[1]),]
data_ev_ex <- data[!(data_ev_ex$Date >= events$start[2] & data_ev_ex$Date <= events$end[2]),]

## Derive Daily data
data_d <- data %>%
	group_by(Date) %>%
	summarise(
				Num_Tweets = length(Tweet.id),
				impressions = sum(impressions),
				engagements = sum(engagements),
				retweets = sum(retweets),
				replies = sum(replies),
				likes = sum(likes),
				user.profile.clicks = sum(user.profile.clicks),
				url.clicks = sum(url.clicks),
				hashtag.clicks = sum(hashtag.clicks),
				detail.expands = sum(detail.expands),
				follows = sum(follows),
				media.views = sum(media.views),
				media.engagements = sum(media.engagements)
			)
data_d$Weekday <- format(data_d$Date,"%w")

## Line Plot per Tweet
# plot(data$Time,data$engagements,type="l",xlab="Day",ylab="Engagements")
# abline(v=as.POSIXct("2021-01-18"),col="red")
# abline(v=as.POSIXct("2021-01-21"),col="red")
# abline(v=as.POSIXct("2021-02-24"),col="blue")
# abline(v=as.POSIXct("2021-03-02"),col="blue")
# legend("topright",legend = c("Titlis","Jungfrau"),col=c("red","blue"),pch=19,cex=.5)
ggplot() +
    geom_rect(aes(xmin = start,xmax = end,ymin = 0, ymax = Inf,fill = name),data = events,show.legend = F)+
    geom_text(aes(x = start,y = 10000,label = name,angle = 90),data = events)+
    geom_line(data=data, aes(x=Time, y=engagements)) + 
    geom_point() +
    scale_x_datetime(date_breaks = "months" , date_labels = "%b-%y")+
    labs(x = "Time", y = "Engagements", title = "Time Series of Engagements")
ggsave("twit_plot/Twitter_Engagement_Over_Time_Tweet_Wise.png", dpi = 300, width = 8, height = 6)

## Line Plot Cummulative per day
# plot(data_d$Date,data_d$engagements,type="l",xlab="Day",ylab="Engagements")
# abline(v=as.POSIXct("2021-01-18"),col="red")
# abline(v=as.POSIXct("2021-01-21"),col="red")
# abline(v=as.POSIXct("2021-02-24"),col="blue")
# abline(v=as.POSIXct("2021-03-02"),col="blue")
# legend("topright",legend = c("Titlis","Jungfrau"),col=c("red","blue"),pch=19,cex=.5)
ggplot() +
    geom_rect(aes(xmin = start,xmax = end,ymin = 0, ymax = Inf,fill = name),data = events,show.legend = F)+
    geom_text(aes(x = start,y = 10000,label = name,angle = 90),data = events)+
    geom_line(data=data_d, aes(x=Date, y=engagements)) + 
    geom_point() +
    scale_x_datetime(date_breaks = "months" , date_labels = "%b-%y")+
    labs(x = "Time", y = "Engagements", title = "Time Series of Engagements")
ggsave("twit_plot/Twitter_Engagement_Over_Time_Day_Wise.png", dpi = 300, width = 8, height = 6)

## Box plot including event data
data_p1 <- data_d %>%
    group_by(Weekday) %>%
    summarise(Med = median(engagements))
data_p2 <- data %>%
    select(Weekday, engagements) %>%
    left_join(data_p1) %>%
    mutate(Weekday = factor(Weekday, labels = c("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")))
ggplot(data = data_p2, aes(x = Weekday, y = engagements)) +
    geom_boxplot(aes(fill = Med)) +
    scale_y_log10() +
    scale_fill_gradient2("Median", low = "red4", mid = "white", high = "green4") +
    labs(
        title = "Weekday Wise Number of Tweet Engagements",
        subtitle = "Data from 6/Aug/2020 to 17/May/2021",
        x = "Weekday",
        y = "Number of Tweet Engagements"
    )
ggsave("twit_plot/Twitter_Engagement_Weekday_Wise_All_Data.png", dpi = 300, width = 8, height = 6)

## Box plot not including event data
data_p1 <- data_ev_ex %>%
    group_by(Weekday) %>%
    summarise(Med = median(engagements))
data_p2 <- data_ev_ex %>%
    select(Weekday, engagements) %>%
    left_join(data_p1) %>%
    mutate(Weekday = factor(Weekday, labels = c("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")))
ggplot(data = data_p2, aes(x = Weekday, y = engagements)) +
    geom_boxplot(aes(fill = Med)) +
    scale_y_log10() +
    scale_fill_gradient2("Median", low = "red4", mid = "white", high = "green4") +
    labs(
        title = "Weekday Wise Number of Tweet Engagements",
        subtitle = "Data from 6/Aug/2020 to 17/May/2021\nExcluding HOPR Titlis testnet: Jan 18 - Jan 21 & HOPR Jungfrau launch: Feb 24 - Mar 2",
        x = "Weekday",
        y = "Number of Tweet Engagements"
    )
ggsave("twit_plot/Twitter_Engagement_Weekday_Wise_Events_Excluded.png", dpi = 300, width = 8, height = 6)
