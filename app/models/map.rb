class Map < ActiveRecord::Base
    attr_accessible :name, :content, :score
    
    belongs_to :user
end
