package main

import (
	"encoding/json"
	"fmt"
  "ioutil"
)

func main() {
	//var jsonBlob = []byte(`[
	//	{"Name": "Platypus", "Order": "Monotremata"},
	//	{"Name": "Quoll",    "Order": "Dasyuromorphia"}
	//]`)
  dat, err := ioutil.ReadFile("AllCards.json")
  if err != nil {
    panic(err)
  }
  fmt.Print(string(dat))
	type Animal struct {
		Name  string
		Order string
	}
	var animals []Animal
	err := json.Unmarshal(jsonBlob, &animals)
	if err != nil {
		fmt.Println("error:", err)
	}
	fmt.Printf("%+v", animals)
}







/*


package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"time"
)

func main() {
	//var jsonBlob = []byte(`[
	//	{"Name": "Platypus", "Id": "5675GGHJA4546", "Cmc": 3.5, "ManaCost": "{3}{U}{U}"}
	//]`)
	jsonBlob, e := ioutil.ReadFile("AllCards.json")
  if e != nil {
    panic(e)
  }
	//fmt.Print(string(jsonBlob))
	type Card struct {
		Name []string
		Text []string
	}
	//var cards Card
	//var cards map[string]interface{}
	var cards interface{}
	err := json.Unmarshal(jsonBlob, &cards)
	if err != nil {
		fmt.Println("error:", err)
	}
	m := cards.(map[string]interface{})
	//fmt.Printf("%+v", cards)
	//fmt.Println(len(cards))
	//for i := range cards {
	//	fmt.Printf("%+v\n", cards[i])
	//}
	//fmt.Printf("%+v", m)
	fmt.Println("end")
	fmt.Println(len(m))
	for k, v := range m {
    switch vv := v.(type) {
    case string:
        fmt.Println(k, "is string", vv)
    case int:
        fmt.Println(k, "is int", vv)
    case []interface{}:
        fmt.Println(k, "is an array:")
        for i, u := range vv {
            fmt.Println(i, u)
        }
    default:
        fmt.Println(string(k), "is of a type I don't know how to handle")
    }
		time.Sleep(6 * time.Millisecond)
	}
}
*/
