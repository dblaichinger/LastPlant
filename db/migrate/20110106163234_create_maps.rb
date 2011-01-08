class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.string :name

      t.integer :score
	  
      t.integer :user_id
	  
      t.timestamps
    end
    add_index :maps, :user_id
  end

  def self.down
    drop_table :maps
  end
end
