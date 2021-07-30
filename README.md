# Snacks In A Van (INFO30005, 2021 1st Semester)
This README will briefy describe the functions of a Food-Truck App System that was completed in my third year of university for the subject INFO30005 (Web Information &amp; Technologies) in the first half of 2021 at the University of Melbourne.

Adaptations and rough changes has been made from the original README to allow for better explanation of certain features and usage from both sides with sensitive information such as routing and Unit/Integration Testing methods omitted.

In this project I was involved in the following tasks:
* Unit & integration Testing
* Displaying the map and top 5 nearest vendors
* Adding snacks to cart
* Error pages and handling
* CSS Styling 

### Heroku Site
https://snacks-in-a-van-ccb.herokuapp.com

# Cultured Coding Buddies (CCB) - Snacks in A Van App

## Table of contents
* [Team Members](#team-members)
* [Introduction](#introduction)
* [Technologies](#technologies)
* [Customer Features](#customer-features)
* [Vendor Features](#vendor-features)

## Team Members
| Name              |
| :---              |
| Dyno Wibowo       |  
| Elisha Chung      | 
| Michelle Moy      |       
| Stephen Iskandar  |  
| Tien Foong Leong  |  



## Introduction
The current version of this app includes the features for customers, including logging in and signing up, viewing the details of the menu and snacks, adding snacks to their cart, making an order and viewing their order details.

## Customer Features
This section will demonstrate what the customer can do with this web-app.
* Select a van to order from (and see its status/distance away from)
  * Based on current geolocation (if allowed)
* Order items from a standardised menu 
* View information about each item on the menu
* Edit their item cart
* Create an account and view past orders & details 
* Change account details

All customer's information are encrypted in the database using an encryption API.

## Vendor Features
This section will demonstrate the features of the vendor side.

A dummy login will be provided for this case:
- Van name: `Milo Truck`
- Password: `1miloperpersononlypls`

Vendors will be able to:
* Enter their current location after logging in and "opening" their van for business
* View current/past orders that will be updated live 
* View order information and additional details like time ordered, quantities etc.
* Mark orders as completed/picked up

