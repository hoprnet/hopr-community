## Load libraries
library(jsonlite)
library(lubridate)
library(tidyverse)
options(scipen=99)

## Read in data
data <- as.data.frame(fromJSON("telegram_data/hopr_tg_message.json"))
names(data) <- c("Day","Num_Msgs")
data$Day <- as_datetime(data$Day/1000)
data$Weekday <- format(data$Day,"%w")

## Events DF
events <- data.frame(
                        start = as_datetime(c("2021-01-18","2021-02-24")),
                        end = as_datetime(c("2021-01-21","2021-03-02")),
                        name = c("Titlis Testnet","Jungfrau Launch")
                    )

## Data Events Excluded
data_ev_ex <- data[!(data$Day >= events$start[1] & data$Day <= events$end[1]),]
data_ev_ex <- data[!(data_ev_ex$Day >= events$start[2] & data_ev_ex$Day <= events$end[2]),]

## Line Plot
# plot(data$Day,data$Num_Msgs,type="l",xlab="Day",ylab="Num Messages")
# abline(v=as.POSIXct("2021-01-18"),col="red")
# abline(v=as.POSIXct("2021-01-21"),col="red")
# abline(v=as.POSIXct("2021-02-24"),col="blue")
# abline(v=as.POSIXct("2021-03-02"),col="blue")
# legend("topright",legend = c("Titlis","Jungfrau"),col=c("red","blue"),pch=19)
ggplot() +
    geom_rect(aes(xmin = start,xmax = end,ymin = 0, ymax = Inf,fill = name),data = events,show.legend = F)+
    geom_text(aes(x = start,y = 4000,label = name,angle = 90),data = events)+
    geom_line(data=data, aes(x=Day, y=Num_Msgs)) + 
    geom_point() +
    scale_x_datetime(date_breaks = "months" , date_labels = "%b-%y")+
    labs(x = "Time", y = "Number of Telegram Messages", title = "Time Series of Number of Telegram Messages")
ggsave("telegram_plot/Telegram_Messages_Over_Time.png", dpi = 300, width = 8, height = 6)


## Box plot including event data
# boxplot(Num_Msgs ~ Weekday, data=data, col=c("red", "limegreen"), las=2,ylab=NULL,horizontal = TRUE)
data_p1 <- data %>%
    group_by(Weekday) %>%
    summarise(Med = median(Num_Msgs))
data_p2 <- data %>%
    select(Weekday, Num_Msgs) %>%
    left_join(data_p1) %>%
    mutate(Weekday = factor(Weekday, labels = c("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")))
ggplot(data = data_p2, aes(x = Weekday, y = Num_Msgs)) +
    geom_boxplot(aes(fill = Med)) +
    scale_y_log10() +
    scale_fill_gradient2("Median", low = "red4", mid = "white", high = "green4") +
    labs(
        title = "Weekday Wise Number of Telegram Messages",
        subtitle = "Data from 6/Aug/2020 to 17/May/2021",
        x = "Weekday",
        y = "Number of Telegram Messages"
    )
ggsave("telegram_plot/Telegram_Messages_Weekday_Wise_All_Data.png", dpi = 300, width = 8, height = 6)


## Box plot not including event data
boxplot(Num_Msgs ~ Weekday, data=data_ev_ex, col=c("red", "limegreen"), las=2,ylab=NULL,horizontal = TRUE)
data_p1 <- data_ev_ex %>%
    group_by(Weekday) %>%
    summarise(Med = median(Num_Msgs))

data_p2 <- data_ev_ex %>%
    select(Weekday, Num_Msgs) %>%
    left_join(data_p1) %>%
    mutate(Weekday = factor(Weekday, labels = c("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")))

ggplot(data = data_p2, aes(x = Weekday, y = Num_Msgs)) +
    geom_boxplot(aes(fill = Med)) +
    scale_y_log10() +
    scale_fill_gradient2("Median", low = "red4", mid = "white", high = "green4") +
    labs(
        title = "Weekday Wise Number of Telegram Messages",
        subtitle = "Data from 6/Aug/2020 to 17/May/2021\nExcluding HOPR Titlis testnet: Jan 18 - Jan 21 & HOPR Jungfrau launch: Feb 24 - Mar 2",
        x = "Weekday",
        y = "Number of Telegram Messages"
    )
ggsave("telegram_plot/Telegram_Messages_Weekday_Wise_Events_Excluded.png", dpi = 300, width = 8, height = 6)